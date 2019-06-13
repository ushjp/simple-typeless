import React, { KeyboardEvent } from 'react';
import ReactDOM from 'react-dom';
import { createActions, createEpic, createReducer, initialize, useActions, useMappedState, useModule } from 'typeless';

export const MODULE = 'counter';

export const Msg = createActions(MODULE, {
  increment: null,
  decrement: null,
  keyDown: (event: KeyboardEvent) => ({ payload: { event }}),
});

export interface CounterState {
  count: number;
}

declare module 'typeless/types' {
  interface DefaultState {
    count: CounterState;
  }
}

const epic = createEpic(MODULE)
  .on(Msg.keyDown, ({ event }, { getState }) => {
    console.log(event.key);
    if (event.key === 'w') {
      return Msg.decrement();
    } else if (event.key === 's') {
      return Msg.increment();
    }
    return [];
  });

const reducer = createReducer({ count: 0 })
  .on(Msg.increment, state => {
    state.count++;
  })
  .on(Msg.decrement, state => {
    state.count--;
  });

function Main() {
  useModule({
    epic,
    reducer,
    reducerPath: ['count'],
  });

  const { increment, decrement, keyDown } = useActions(Msg);
  const { count } = useMappedState(state => state.count);
  return (
    <div tabIndex={0} onKeyDown={keyDown}>
      <button onClick={decrement}>-</button>
      <div>{count}</div>
      <button onClick={increment}>+</button>
    </div>
  );
}

const { TypelessProvider } = initialize();

ReactDOM.render(
  <TypelessProvider>
    <Main />
  </TypelessProvider>,
  document.getElementById('root'),
);
