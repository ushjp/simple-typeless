import React from 'react';
import ReactDOM from 'react-dom';
import { createActions, createEpic, createReducer, initialize, useActions, useMappedState, useModule } from 'typeless';

export const MODULE = 'counter';

export const Msg = createActions(MODULE, {
  $mounted: null,
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
  .on(Msg.$mounted, () => {
    // FIXME: 以下のような警告が出て、incrementやdecrement時にエラーになる
    // Warning: Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function.
    const { keyDown } = useActions(Msg);
    document.addEventListener('keydown', e => keyDown(e));
  })
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
    actions: Msg,
  });

  const { increment, decrement } = useActions(Msg);
  const { count } = useMappedState(state => state.count);
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
