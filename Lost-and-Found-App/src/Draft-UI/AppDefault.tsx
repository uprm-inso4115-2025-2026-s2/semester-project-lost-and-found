import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// !Default generated Application. Any assets used by this can be removed. //
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

// !Database Sync Test //
// import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
// );

// type Example = {
//   id: number;
//   name: string;
// };

// function App() {
//   const [examples, setExamples] = useState<Example[]>([]);

//   useEffect(() => {
//     getExamples();
//   }, []);

//   async function getExamples() {
//     const { data, error } = await supabase
//       .from("Example")
//       .select();

//     if (error) {
//       console.error(error);
//       return;
//     }

//     if (data) {
//       setExamples(data);
//     }
//   }

//   return (
//     <ul>
//       {examples.map((example) => (
//         <li key={example.id}>{example.name}</li>
//       ))}
//     </ul>
//   );
// }

// export default App;