import './App.css';
import Movie from './components/Movie'
import SearchBar from './components/SearchBar';


require('dotenv').config();
const omdbKey = process.env.REACT_APP_OMDB_KEY;

let dummyMovie = {"Title":"Hello World","Year":"2019","imdbID":"tt9418812","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BOGIwYjZlOTctZTNhOC00OTdiLWI5ZWItOTdiMWRjMjUwMDlhXkEyXkFqcGdeQXVyNDQxNjcxNQ@@._V1_SX300.jpg"};
let dummyMovie2 = {"Title":"Hello World two!!!","Year":"2019","imdbID":"tt9418812eeeee","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BOGIwYjZlOTctZTNhOC00OTdiLWI5ZWItOTdiMWRjMjUwMDlhXkEyXkFqcGdeQXVyNDQxNjcxNQ@@._V1_SX300.jpg"};
let dummyResults = [dummyMovie, dummyMovie2];

function dummyCallback (what){
  //hello
  //who is it
  //its axios calling
  //ok later
  console.log(what);
}

function App() {

  return (

<div className="app">
  <div className="top-row">
    The Shoppies!!!!!! space space space space space space (buttons here)
    (maybe a light/dark mode slider if im feeling it)
  </div>
  <div className="main-row">
    <div id="results-panel" className="panel popout">
      <SearchBar changeCallback = {dummyCallback}/>
      {dummyResults.map(function (movieProps) {
        return <Movie {...movieProps} key={movieProps.imdbID} />
        // ^ thanks stackoverflow very cool https://stackoverflow.com/questions/49081549/passing-object-as-props-to-jsx
      })}
    </div>
    <div id="nominations-panel" className="panel popout">
      eee
    </div>
  </div>
</div>

  );
}

export default App;
