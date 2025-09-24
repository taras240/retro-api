export const stateboxClickHandler = (event) => {
    const statebox = event.target;
    const prevState = +statebox.dataset.state;
    const state = prevState === 1 ? -1 : prevState + 1;
    const value = statebox.dataset.value;
    statebox.dataset.state = state;
    statebox.dataset.event && new Function("event", "state", "filterName", statebox.dataset.event)(event, state, value);
}
