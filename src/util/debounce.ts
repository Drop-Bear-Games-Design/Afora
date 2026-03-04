export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  } as T & { cancel(): void };
  debounced.cancel = () => { if (timer) clearTimeout(timer); };
  return debounced;
}
