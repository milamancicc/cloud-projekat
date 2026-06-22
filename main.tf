terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "= 4.1.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "1db7dd74-18da-44e3-804e-056393fbefef"
}

provider "docker" {
  registry_auth {
    address  = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "resources"
  location = "Sweden Central"
}

resource "azurerm_container_registry" "acr" {
  name                = "cloudfinalmila"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "docker_registry_image" "backend" {
  name = "${azurerm_container_registry.acr.login_server}/backend:latest"

  build {
    context = "${path.module}/backend"
  }

  depends_on = [azurerm_container_registry.acr]
}

resource "docker_registry_image" "frontend" {
  name = "${azurerm_container_registry.acr.login_server}/frontend:latest"

  build {
    context = "${path.module}/frontend"
  }

  depends_on = [azurerm_container_registry.acr]
}

resource "azurerm_container_group" "app" {
  name                = "cloud-final-app"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  ip_address_type     = "Public"
  dns_name_label      = "cloud-final-mila"

  tags = {
    Environment = "Dev"
    Service     = "media-app"
  }

  container {
    name   = "backend"
    image  = docker_registry_image.backend.name
    cpu    = "1.5"
    memory = "2.0"

    ports {
      port     = 3000
      protocol = "TCP"
    }
  }

  container {
    name   = "frontend"
    image  = docker_registry_image.frontend.name
    cpu    = "0.5"
    memory = "0.5"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  image_registry_credential {
    server   = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }

  depends_on = [
    docker_registry_image.backend,
    docker_registry_image.frontend,
  ]
}

output "frontend_url" {
  value = "http://${azurerm_container_group.app.fqdn}"
}

output "backend_url" {
  value = "http://${azurerm_container_group.app.fqdn}:3000/media"
}