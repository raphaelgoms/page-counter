const fs = require('fs');
const fsPromise = fs.promises;

function info(fn) {

    const file = {
        path: fn,
        exists: false,
        read: false,
        write: false,
        isFile: false,
        isDir: false,
        time: 0
    };

    return Promise.all([
        fsPromise.access(fn, fs.constants.F_OK),
        fsPromise.access(fn, fs.constants.R_OK),
        fsPromise.access(fn, fs.constants.W_OK)
    ])
        .then(fInfo => {

            file.exists = !fInfo[0];

            if (!file.exists) return file;
            else {

                file.read = !fInfo[1];
                file.write = !fInfo[2];

                return fsPromise.stat(fn)
                    .then(fStat => {

                        file.isFile = fStat.isFile();
                        file.isDir = fStat.isDirectory();
                        file.time = fStat.mtimeMs;
                        return file;

                    })
                    .catch(() => file);
            }

        })
        .catch(() => file);
}

async function folderUsable(folder) {

    try {
        let fInfo = await info(folder);

        if (!fInfo.isDir) {
            await fsPromise.mkdir(folder);
            fInfo = await info(folder);
        }

        return (fInfo.isDir && fInfo.read && fInfo.write ? fInfo : false);
    }
    catch (err) {
        console.log('folderUsable error:', err);
        return false;
    }
}

async function folderList(folder, ext = '', sortBy = 'time') {
    try {
        let filelist = await fsPromise.readdir(folder);

        filelist = await Promise.all(
            filelist.map(async f => await info(folder + f))
        );

        return filelist
            .filter(fn => fn.isFile && fn.read && fn.path.endsWith(ext))
            .sort((f1, f2) => f2[sortBy] - f1[sortBy]);

    }
    catch (err) {
        console.log('folderList error', err);
        return false;
    }
}

async function write(fn, content = '') {

    try {
        await fsPromise.writeFile(fn, content);
        return true;
    }
    catch (err) {
        console.log('write error', err);
        return false;
    }

}


async function unlinkMany(fnlist) {
    return await Promise.all(
        fnlist.map(async fn => {
            try {
                await fsPromise.unlink(fn.path ? fn.path : fn);
                return true;
            }
            catch (err) {
                console.log('unlink error', err);
                return false;
            }
        })
    );
}


module.exports = {
    info,
    folderUsable,
    folderList,
    write,
    unlinkMany
  };