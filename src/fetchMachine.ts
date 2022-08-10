import { assign, createMachine } from "xstate";
import {fetchRestaurants} from './data'

interface IFetchContext {
  restaurants?: IRestaurant[];
  error?: Error
}

type InitialContext = IFetchContext & {
  restaurants: undefined;
  error: undefined;
};

type ReadyContext = IFetchContext & {
  restaurants: IRestaurant[];
  error: undefined;
};

type LoadingContext = IFetchContext & {
  restaurants: IRestaurant[];
  error: undefined;
};

type SuccessContext = IFetchContext & {
  restaurants: IRestaurant[];
  error: undefined;
};

type FailureContext = IFetchContext & { restaurants: undefined; error: Error };

type InitialState = { value: 'initial'; context: InitialContext };
type ReadyState = { value: 'ready'; context: ReadyContext };
type LoadingState = { value: 'loading'; context: LoadingContext };
type SuccessState = { value: 'success'; context: SuccessContext };
type FailureState = { value: 'failure'; context: FailureContext };

type FetchState =
  | InitialState
  | ReadyState
  | LoadingState
  | SuccessState
  | FailureState;

type FetchEvent = {type: 'FETCH'} | {type: 'RETRY'}

const fetchMachine = createMachine<IFetchContext, FetchEvent, FetchState>({
  id: 'fetch',
  initial: 'initial',
  context: {
    restaurants: undefined,
    error: undefined
  },
  states: {
    initial: {
      on: {
        FETCH: 'loading',
      }
    },
    ready: {
      on: {
        FETCH: 'loading',
      }
    },
    loading: {
      entry: assign({
        restaurants: (context, _event) => context.restaurants || [],
        error: (_context, _event) => undefined
      }),

      invoke: {
        id: 'getRestaurants',
        src: (_context, _event) => fetchRestaurants(),
        onDone: {
          target: 'success',
          actions: assign({
            restaurants: (_context, event) => event.data
          })
        },
        onError: {
          target: 'failure',
          actions: assign({
            restaurants: (_context, _event) => undefined,
            error: (_context, event) => event.data
          })
        }
      }
    },
    success: {
      after: {
        2500: 'ready'
      }
    },
    failure: {
      on: {
        RETRY: 'loading'
      }
    }
  }
})

export {fetchMachine}
