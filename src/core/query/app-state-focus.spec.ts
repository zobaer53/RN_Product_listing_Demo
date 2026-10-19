import { focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

import { subscribeAppStateFocus } from './app-state-focus';

describe('subscribeAppStateFocus', () => {
  it('[CORE-QRY-05] drives TanStack focus from AppState and cleans up', () => {
    let emit: (status: AppStateStatus) => void = () => undefined;
    const remove = jest.fn();
    const addEventListener = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_type, listener) => {
        emit = listener as (status: AppStateStatus) => void;
        return { remove };
      });

    const unsubscribe = subscribeAppStateFocus();
    emit('background');
    expect(focusManager.isFocused()).toBe(false);
    emit('active');
    expect(focusManager.isFocused()).toBe(true);

    unsubscribe();
    expect(remove).toHaveBeenCalled();
    addEventListener.mockRestore();
  });
});
