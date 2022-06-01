const httpReferrer = require('./httpreferrer');
const fileUtil = require('./fileutil');
const path = require('path');

const dataFolder = path.resolve('./data') + path.sep;
const saveFrequency = 10 * 1000; // ms
module.exports = class {

    constructor() {
        this.counter = {};

            (async () => {

                // store folder available?
                this.folder = await fileUtil.folderUsable(dataFolder);
                if (!this.folder) return;

                // fetch all JSON files sorted most recent first
                this.saved = await fileUtil.folderList(this.folder.path, '.json');

                // import and merge latest data
                if (this.saved.length) {
                    Object.assign(this.counter, require(this.saved[0].path));
                }

            })();
    }

    count(req) {
        let hash = httpReferrer(req);
        if (!hash) return null;

        this.counter[hash] = this.counter[hash] || 0;

        this.saveTimer = this.saveTimer || setTimeout(this.save.bind(this), saveFrequency);

        return ++this.counter[hash];
    }

    async save() {
        if (!this.folder) return;

        let fn = `${this.folder.path}hit${+ new Date()}.json`;

        if (await fileUtil.write(fn, JSON.stringify(this.counter))) {
            console.log(`page hits stored: ${fn}`);
            fileUtil.unlinkMany(this.saved);
            this.saved = [{ path: fn }];
        }

        this.saveTimer = null;
    }
}