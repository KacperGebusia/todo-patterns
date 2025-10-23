// [PATTERN: Command] — interfejs bazowy
export class ICommand { async do(){ throw new Error("Not implemented"); } meta(){ return { name: this.constructor.name }; } }
