import {faste} from "../src";

describe('Faste busy', () => {
  it('busy flow', () => {
    const uncertainty = faste()
      .withMessages(['tick','observe'])
      .withState({ counter: 0})

      .on('tick', ({setState, state}) => setState({counter: state.counter+1}))
      .on('observe', async ({transitTo}, observer: Promise<any>) => {
        transitTo('@busy');
        observer.then(() => transitTo('@current'))
      })

      .create()
      .start('idle');

    expect(uncertainty.put('tick').instance().state.counter).toBe(1);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);

    let pResolve: () => void;
    const p = new Promise(resolve => {pResolve = resolve});
    uncertainty.put('observe', p);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);

    pResolve();

    return p.then(() => {
      expect(uncertainty.put('tick').instance().state.counter).toBe(5);
      expect(uncertainty.put('tick').instance().state.counter).toBe(6);
    });
  });

  it('locked flow', () => {
    const uncertainty = faste()
      .withMessages(['tick','observe'])
      .withState({ counter: 0})

      .on('tick', ({setState, state}) => setState({counter: state.counter+1}))
      .on('observe', async ({transitTo}, observer: Promise<any>) => {
        transitTo('@locked');
        observer.then(() => transitTo('@current'))
      })

      .create()
      .start('idle');

    expect(uncertainty.put('tick').instance().state.counter).toBe(1);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);

    let pResolve: () => void;
    const p = new Promise(resolve => {pResolve = resolve});
    uncertainty.put('observe', p);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);
    expect(uncertainty.put('tick').instance().state.counter).toBe(2);

    pResolve();
    return p.then(() => {
      expect(uncertainty.put('tick').instance().state.counter).toBe(3);
      expect(uncertainty.put('tick').instance().state.counter).toBe(4);
    });
  })
});