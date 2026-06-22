let form = document.querySelector("#form");
let resetButton = document.getElementById("reset");
let years = [];
let activeYear = null;
const API_URL = `http://${window.location.hostname}:3000`;

//Loading the fixed examples from API
addEventListener("load", loadFromAPI);

form.addEventListener("submit", handleSubmit);

resetButton.addEventListener("click", reset);


const inputHandler = ()=>{
    let searchInput = document.getElementById("search");
    searchInput.addEventListener("input", ()=>{
        search()
    });
}

inputHandler();



function search(){

    let input = document.getElementById("search").value.toLowerCase();


    if(!activeYear){
        let movies = document.querySelectorAll("#movietable tbody tr");
        for(movie of movies){
            if(movie.children[1].textContent.toLowerCase().includes(input) || movie.children[3].textContent.toLowerCase().includes(input)){
                movie.classList.remove("noshow");
            }
            else{
                movie.classList.add("noshow");
            }
        }
    }
    else{
        let movies = document.querySelectorAll("#movietable tbody tr");
        for(movie of movies){
            if((movie.children[1].textContent.toLowerCase().includes(input) || movie.children[3].textContent.toLowerCase().includes(input)) && parseInt(movie.children[2].textContent) == activeYear){
                movie.classList.remove("noshow");
            }
            else{
                movie.classList.add("noshow");
            }
        }
    }

}


async function loadYearList(){
    let response = await fetch(`${API_URL}/media`);
    let movies = await response.json();
    years = [];
    for(movie of movies){
        if(!years.includes(movie.year)){
            years.push(movie.year);
        }
    }
    years.sort((a,b)=>a-b);
    let list = document.getElementById("yearList");
    list.innerHTML="";
    for(y of years){
        let li = document.createElement("li");
        li.id = `year${y}`;
        li.textContent = y;
        li.addEventListener("click", ()=>{filterTable(li.textContent)});
        list.appendChild(li);
    }
    for(y in years){
        let item = document.querySelector("#yearList li")
    }
}

async function filterTable(y){

    let movies = document.querySelectorAll("#movietable tbody tr");
    let whatYear = document.getElementById("whatYear");

    if(activeYear === y){
        // for(movie of movies){
        //     movie.classList.remove("noshow");
        // }
        activeYear = null;
        whatYear.innerHTML="";
        search();
        return;
    }
    activeYear = y;


    // for(movie of movies){

    //     if(parseInt(movie.children[2].textContent) != y){
    //         movie.classList.add("noshow");
    //     }
    //     else{
    //         movie.classList.remove("noshow");
    //     }
    // }
    whatYear.innerHTML = "";
    let announcement = document.createElement("p");
    announcement.textContent = `Movies from ${y} are currently displayed in the table.`;
    whatYear.appendChild(announcement);
    search();

}


async function handleSubmit(event){
    //Preventing the button to leave the site
    event.preventDefault();
    //Making the JS object for the API
    let movie = {
        poster: document.getElementById("poster").value,
        name:document.getElementById("name").value,
        year: document.getElementById("year").value,
        genre: document.getElementById("genre").value,
        description: document.getElementById("description").value
    };
    //Sending the JS object to API as JSON using POST request (CHANGED IT TO THE LOCAL DATABASE)
    let postResponse = await fetch(`${API_URL}/media`, {
        method:"POST",
        headers:{
            "Content-type": "application/json"
        },
        body: JSON.stringify(movie)

    });
    
    //Getting the response back as JSON
    let movieData = await postResponse.json();

    //Get all the information(movies) from API (NOW THE API SENDS BACK THE NEW DATA SO THIS CAN BE SKIPPED)
    //let getResponse = await fetch("http://localhost:3000/all");
    //let allMovies = await getResponse.json();
    //Make a new object that will be added to the table
    //let newMovie;
    //Find the newly added movie in the array from the API
    //for(let i = 0; i < allMovies.length; i++){
        //if(allMovies[i].id === movieData.id){
            //newMovie = allMovies[i];
            //break;
        //}
    //}
    //Add the new movie to the row in table ([0] is needed because the api sends back the moviedata, but its enclosed in an extra [])
    addRowToTable(movieData[0]);
    loadYearList();
    search();

    //The code under is if after submiting info about a movie we want a clean form to submit a different movie

    // document.getElementById("poster").value = "";
    // document.getElementById("name").value = "";
    // document.getElementById("year").value = "";
    // document.getElementById("genre").value = "";
    // document.getElementById("description").value = "";

}

function addRowToTable(data){

    let table = document.getElementById("movietable");
    //Create a new row that will be added to the table
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>
            <figure>
                <img src="${data.poster}" alt="${data.name} data-id=${data.id}Poster" height="100">
            </figure></td>
        <td><strong>${data.name}</strong></td>
        <td>${data.year}</td>
        <td><em>${data.genre}</em></td>
        <td>${data.description}</td>`;
    //Inserting the new row
    table.querySelector("tbody").appendChild(newRow);

    let img = newRow.querySelector("img");
    img.addEventListener("click", ()=>updateForm(data));
        
    loadYearList();

}



function updateForm(data){
    modal.style.display = "flex";
    modal.style.alignItems="center";
    modal.style.justifyContent="center";
    
    document.getElementById("poster").value = data.poster;
    document.getElementById("name").value = data.name;
    document.getElementById("year").value = data.year;
    document.getElementById("genre").value = data.genre;
    document.getElementById("description").value = data.description;

    document.getElementById("submit").remove();
    document.getElementById("updateRow").innerHTML='<input type="button" class="noprint" id="update" value="Update">';

    let updateButton = document.getElementById("update");
    

    updateButton.addEventListener("click", async()=>{
        
        let form = document.getElementById("form");
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }


        let updatedMovie = {
            poster: document.getElementById("poster").value,
            name: document.getElementById("name").value,
            year: document.getElementById("year").value,
            genre: document.getElementById("genre").value,
            description: document.getElementById("description").value,
            id: data.id,
        };

        //CHANGED TO LOCAL DATABSE
        let response = await fetch(`${API_URL}/media/${data.id}`, {
            method:"PUT",
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify(updatedMovie)

        });

        document.querySelector("#movietable tbody").innerHTML = "";
        loadFromAPI();
        loadYearList();
        document.getElementById("whatYear").innerHTML="";
        document.getElementById("search").value="";

    });

    
    close.addEventListener("click", function(){
        modal.style.display = "none";
        document.getElementById("poster").value = "";
        document.getElementById("name").value = "";
        document.getElementById("year").value = "";
        document.getElementById("genre").value = "";
        document.getElementById("description").value = "";

        document.getElementById("buttons").innerHTML = '<input type="submit" class="noprint" id="submit">';
        document.getElementById("updateRow").innerHTML='';

    })

    window.addEventListener("click", function(event){
        if(event.target == modal){
            modal.style.display = "none";
            document.getElementById("poster").value = "";
            document.getElementById("name").value = "";
            document.getElementById("year").value = "";
            document.getElementById("genre").value = "";
            document.getElementById("description").value = "";

            document.getElementById("buttons").innerHTML = '<input type="submit" class="noprint" id="submit">';
            document.getElementById("updateRow").innerHTML='';
        }

    })



}



async function loadFromAPI(){
    let response = await fetch(`${API_URL}/media`);
    let movies = await response.json();
    for(let i = 0; i < movies.length; i++){
        addRowToTable(movies[i]);
    }
    loadYearList();
}




//Reset function to reset the database
async function reset(){
    //console.log("Reset button clicked!"); //test to see if reset button works

    let response = await fetch(`${API_URL}/media`, {
        method: "DELETE"
    });

    //console.log("not quite yet")    
    setTimeout(()=>{
            document.querySelector("#movietable tbody").innerHTML = "";
            loadFromAPI()
            //console.log("triggered")
            
        }, 600);


    
    loadYearList();
    document.getElementById("search").value = "";
    document.getElementById("whatYear").innerHTML= "";
    //console.log("Done!");
    
}

let modal = document.getElementById("formModal");
let openForm = document.getElementById("openForm");
let close = document.getElementsByClassName("close")[0];


openForm.addEventListener("click", function(){
    modal.style.display = "flex";
    modal.style.alignItems="center";
    modal.style.justifyContent="center";
});

close.addEventListener("click", function(){
    modal.style.display = "none";
    
    document.getElementById("poster").value="";
    document.getElementById("name").value ="";
    document.getElementById("year").value="";
    document.getElementById("genre").value="";
    document.getElementById("description").value="";
});

window.addEventListener("click", function(event){
    if(event.target == modal){
        modal.style.display = "none";
        document.getElementById("poster").value="";
        document.getElementById("name").value ="";
        document.getElementById("year").value="";
        document.getElementById("genre").value="";
        document.getElementById("description").value="";
    }
});


