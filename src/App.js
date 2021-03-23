import { useState, useEffect } from "react";
import { from, observable } from "rxjs";
import { map, filter, delay, mergeMap } from "rxjs/operators";
import "./App.css";

let numbersObservable = from([1, 2, 3, 4, 5]);

let squaredNumbers = numbersObservable.pipe(
  filter((val) => val > 2),
  mergeMap((val) => from([val]).pipe(delay(1000 * val))),
  map((val) => val * val)
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
  const [currentNumber, setCurrentNumber] = useState(0);

  useObservable(squaredNumbers, setCurrentNumber);

  return (
    <div className="App">
      <h1>Counter</h1>
      <p>Current count is: {currentNumber}</p>
    </div>
  );
};

export default App;
