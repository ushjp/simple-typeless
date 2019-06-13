import React from 'react';
import ReactDOM from 'react-dom';
import { createActions, createEpic, createReducer, initialize, useActions, useMappedState, useModule } from 'typeless';

export const MODULE = 'counter';

export const Msg = createActions(MODULE, {
  increment: null,
  decrement: null,
  keyDown: (event: KeyboardEvent) => ({ payload: { event }}),
  addListener: (listener: (e: KeyboardEvent) => void) => ({ payload: { listener }}),
});

export interface CounterState {
  count: number;
  listenerAdded: boolean;
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

const reducer = createReducer({ count: 0, listenerAdded: false })
  .on(Msg.increment, state => {
    state.count++;
  })
  .on(Msg.decrement, state => {
    state.count--;
  })
  .on(Msg.addListener, (state, { listener }) => {
    document.addEventListener('keydown', listener);
    state.listenerAdded = true;
  });

function Main() {
  useModule({
    epic,
    reducer,
    reducerPath: ['count'],
  });

  const { increment, decrement, keyDown, addListener } = useActions(Msg);
  const { count, listenerAdded } = useMappedState(state => state.count);
  if (!listenerAdded) {
    addListener(keyDown);
  }
  return (
    <div>
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
