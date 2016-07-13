class Command {
    constructor(app) {
        this._app = app;
        this._cmd = '';
        this._args = '';
        this._target = '';
    }

    command(cmd) {
        this._cmd = cmd;
        return this;
    }

    target(name) {
        this._target = name;
        return this;
    }

    args(args) {
        this._args = args;
        return this;
    }

    get() {
        return [this._app, this._cmd, this._target, this._args].join(' ')
    }
}


// ['pm', 'start', './', '--name=app --watch ./'].join(' ')
