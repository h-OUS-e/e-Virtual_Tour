import React, { useState } from 'react';

function Counter() {
  // Declare a new state variable called "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Counter</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}

export default Counter;