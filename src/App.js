import { useState } from 'react';
import logo from './logo.svg';
import './App.css';

/*
function Welcome(props){
  return <h2>Welcome, {props.name}!</h2>
}

function Show(props){
  return <h2>{props.name}</h2>
}
*/

function Counter() {
  const [count, setCount] = useState(0);

function handleClick(){
  setCount(count + 1);
}

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => handleClick(count + 1)}>
        Click me
      </button>
    </div>
  );
}

function App() {
  return (
    /*
    <div style={{textAlign: "center"}}>
      <Welcome name ="Vanderlei"/>
      <Show name ="Bedania"/>
      <Show name ="Mendoza"/>
      
    </div>
    */
   <div>
      <Counter />
   </div>
  );
}

export default App;
