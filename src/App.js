import { useState, useEffect } from "react";
import { BehaviorSubject, from } from "rxjs";
import {
  filter,
  mergeMap,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "./App.css";
import pokeball from "./assets/pokeball.png";

const getPokemonByName = async (name) => {
  const { results: allPokemon } = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000"
  ).then((res) => res.json());
  return allPokemon.filter((pokemon) => pokemon.name.includes(name));
};

const getPokemonImage = (pokemonUrl) => {
  return `https://pokeres.bastionbot.org/images/pokemon/${
    pokemonUrl.split("/")[6]
  }.png`;
};

let searchSubject = new BehaviorSubject("");

let searchResultObservable = searchSubject.pipe(
  filter((val) => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap((val) => from(getPokemonByName(val)))
);

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe((result) => {
      setter(result);
    });
    return () => subscription.unsubscribe();
  }, [observable, setter]);
};

const App = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useObservable(searchResultObservable, setResults);

  const handleSearch = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };

  return (
    <div className="App">
      <h1>Search Pokemon</h1>
      <img src={pokeball} alt="pokemon" className="pokeball" />
      <div>
        <input
          className="search"
          type="text"
          placeholder="Search...."
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="card-outer">
        {results.map((pokemon) => (
          <div key={pokemon.name} className="card">
            <LazyLoadImage
              alt={pokemon.name}
              src={getPokemonImage(pokemon.url)}
              placeholderSrc={pokeball}
            />
            <b>{pokemon.name.toUpperCase()}</b>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
