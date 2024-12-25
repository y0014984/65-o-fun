import Memory from './Memory';

const registerReadWriteBuffer = 0x0217;
const registerReadWriteBufferLength = 0x0219;
const registerCommandBuffer = 0x021a;
const registerCommandBufferLength = 0x021c;
const registerCommandFlow = 0x021f;
const commandFlowReady = 0xe1;
const commandFlowInProgess = 0x99;
const commandFlowDone = 0x87;
const commandReturnValue = 0x021d;
const commandLastError = 0x021e;

const fsObjTypeFile = 0x99;
const fsObjTypeDirectory = 0xe1;
const fsObjTypeProgram = 0x87;

const fsObjMaxNameLength = 24;

const returnValError = 0x00;
const returnValSuccess = 0xff;

const errorMissingParameter = 0x89;
const errorNoFileOrDir = 0xc1;
const errorNotDirectory = 0xa1;
const errorDirExists = 0x85;
const errorFileExists = 0x83;

export class Storage {
    private mem: Memory;
    type: 'ROOT' = 'ROOT';
    fsObjects: FilesystemObject[];
    currentDirFsObjects: FilesystemObject[];
    currentParentDir: Directory | null;

    constructor(mem: Memory) {
        this.mem = mem;

        this.fsObjects = [];
        this.currentDirFsObjects = this.fsObjects;
        this.currentParentDir = null;
    }

    checkMemWrite(index: number) {
        // check writing to storage registers
        if (index === registerCommandFlow) {
            // command flow register
            if (this.mem.int[registerCommandFlow] === commandFlowReady) {
                const commandBufferAddress = this.mem.int[registerCommandBuffer + 1] * 256 + this.mem.int[registerCommandBuffer];
                const commandLength = this.mem.int[registerCommandBufferLength];
                let command = '';
                for (let i = 0; i < commandLength; i++) {
                    command = command.concat(String.fromCharCode(this.mem.int[commandBufferAddress + i]));
                }

                console.log(`Storage command received: '${command}'`);

                this.mem.setInt(registerCommandFlow, commandFlowInProgess);

                let param;

                switch (command.substring(0, 3)) {
                    case 'FOC':
                        this.getFilesystemObjectsCount();
                        break;
                    case 'GFT':
                        this.getFilesystemObjectType(command.substring(3, 4).charCodeAt(0));
                        break;
                    case 'GFS':
                        this.getFileSize(command.substring(3, 4).charCodeAt(0));
                        break;
                    case 'GFN':
                        this.getFilesystemObjectName(command.substring(3, 4).charCodeAt(0));
                        break;
                    case 'GTD':
                        param = this.getCommandStringParam(command, commandLength);
                        this.gotoDirectory(param);
                        break;
                    case 'CDI':
                        param = this.getCommandStringParam(command, commandLength);
                        this.createDirectory(param);
                        break;
                    case 'GWD':
                        this.getWorkingDirectory();
                        break;
                    default:
                        break;
                }

                this.mem.setInt(registerCommandFlow, commandFlowDone);
            }
        }
    }

    getCommandStringParam(command: string, commandLength: number) {
        let param = '';

        for (let i = 3; i < commandLength; i++) {
            const char = command[i];
            if (char.charCodeAt(0) === 0x00) break;
            param += char;
        }

        return param;
    }

    gotoDirectory(subDirName: string) {
        subDirName.trim();

        if (subDirName === '') {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorMissingParameter);
            return;
        }

        if (subDirName === '/') {
            this.currentDirFsObjects = this.fsObjects;
            this.currentParentDir = null;

            this.mem.setInt(commandReturnValue, returnValSuccess);
            return;
        }

        if (subDirName[0] === '/' && subDirName.length > 1) {
            const path = subDirName.split('/');
            path.shift();

            let targetDir: Storage | FilesystemObject | undefined = this;

            targetDir = this.getDirFromPathArray(targetDir, path);

            if (!targetDir) {
                this.mem.setInt(commandReturnValue, returnValError);
                this.mem.setInt(commandLastError, errorNoFileOrDir);
            } else {
                this.currentDirFsObjects = (targetDir as Directory).fsObjects;
                this.currentParentDir = targetDir as Directory;

                this.mem.setInt(commandReturnValue, returnValSuccess);
            }
            return;
        }

        if (subDirName[0] !== '/' && subDirName.length > 1 && subDirName.includes('/')) {
            const path = subDirName.split('/');

            let targetDir: Storage | FilesystemObject | undefined;
            targetDir = this.currentParentDir as Directory;
            if (this.currentParentDir === null) targetDir = this;

            targetDir = this.getDirFromPathArray(targetDir, path);

            if (!targetDir) {
                this.mem.setInt(commandReturnValue, returnValError);
                this.mem.setInt(commandLastError, errorNoFileOrDir);
            } else {
                this.currentDirFsObjects = (targetDir as Directory).fsObjects;
                this.currentParentDir = targetDir as Directory;

                this.mem.setInt(commandReturnValue, returnValSuccess);
            }
            return;
        }

        if (subDirName === '..') {
            if (this.currentParentDir !== null) {
                const nextParentDir = this.currentParentDir.parentDir;
                if (nextParentDir === null) {
                    this.currentDirFsObjects = this.fsObjects;
                    this.currentParentDir = null;
                } else {
                    this.currentDirFsObjects = nextParentDir.fsObjects;
                    this.currentParentDir = nextParentDir;
                }
            }

            this.mem.setInt(commandReturnValue, returnValSuccess);
            return;
        }

        let subDir = this.currentDirFsObjects.find(fsObj => fsObj.name === subDirName);

        if (!subDir) {
            const subDirNumber = parseInt(subDirName);
            if (!isNaN(subDirNumber) && subDirNumber >= 0 && subDirNumber <= this.currentDirFsObjects.length - 1) {
                subDir = this.currentDirFsObjects[subDirNumber];
            }
        }

        if (!subDir) {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorNoFileOrDir);
            return;
        }

        if (subDir.type !== 'DIRECTORY') {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorNotDirectory);
            return;
        }

        this.currentDirFsObjects = (subDir as Directory).fsObjects;
        this.currentParentDir = subDir as Directory;

        this.mem.setInt(commandReturnValue, returnValSuccess);
    }

    createDirectory(dirName: string) {
        dirName.trim();

        if (dirName === '') {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorMissingParameter);
            return;
        }

        if (dirName === '/') {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorDirExists);
            return;
        }

        if (dirName[0] === '/' && dirName.length > 1) {
            const path = dirName.split('/');
            path.shift();

            const newDirName = (path.pop() as string).substring(0, fsObjMaxNameLength);

            let targetDir: Storage | FilesystemObject | undefined = this;

            targetDir = this.getDirFromPathArray(targetDir, path);

            if (!targetDir) {
                this.mem.setInt(commandReturnValue, returnValError);
                this.mem.setInt(commandLastError, errorNoFileOrDir);
            } else {
                const newDir = new Directory(targetDir as Directory, newDirName);
                (targetDir as Directory).fsObjects.push(newDir);

                this.mem.setInt(commandReturnValue, returnValSuccess);
            }
            return;
        }

        if (dirName[0] !== '/' && dirName.length > 1 && dirName.includes('/')) {
            const path = dirName.split('/');

            const newDirName = (path.pop() as string).substring(0, fsObjMaxNameLength);

            let targetDir: Storage | FilesystemObject | undefined;
            targetDir = this.currentParentDir as Directory;
            if (this.currentParentDir === null) targetDir = this;

            targetDir = this.getDirFromPathArray(targetDir, path);

            if (!targetDir) {
                this.mem.setInt(commandReturnValue, returnValError);
                this.mem.setInt(commandLastError, errorNoFileOrDir);
            } else {
                const newDir = new Directory(targetDir as Directory, newDirName);
                (targetDir as Directory).fsObjects.push(newDir);

                this.mem.setInt(commandReturnValue, returnValSuccess);
            }
            return;
        }

        if (dirName === '..') {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorDirExists);
            return;
        }

        let subDir = this.currentDirFsObjects.find(fsObj => fsObj.name === dirName);

        if (subDir) {
            this.mem.setInt(commandReturnValue, returnValError);
            this.mem.setInt(commandLastError, errorFileExists);
            return;
        }

        const newDir = new Directory(this.currentParentDir, dirName);
        this.currentDirFsObjects.push(newDir);

        this.mem.setInt(commandReturnValue, returnValSuccess);
    }

    getDirFromPathArray(targetDir: Storage | FilesystemObject | undefined, path: string[]) {
        while (path.length > 0) {
            if (targetDir!.type === 'FILE' || targetDir!.type === 'PROGRAM') break;

            targetDir = (targetDir as Directory).fsObjects.find(fsObj => fsObj.name === path[0]);

            if (!targetDir) break;

            path.shift();
        }

        return targetDir;
    }

    getFilesystemObjectsCount() {
        this.mem.setInt(commandReturnValue, this.currentDirFsObjects.length);
    }

    getFilesystemObjectName(index: number) {
        const name = this.currentDirFsObjects[index].name;

        const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
        const readWriteBufferLength = this.mem.int[registerReadWriteBufferLength];

        for (let i = 0; i < Math.min(name.length, readWriteBufferLength - 1); i++) {
            this.mem.setInt(readWriteBufferAddress + i, name.charCodeAt(i));
        }
    }

    getWorkingDirectory() {
        const path = [];
        let tmpDir = this.currentParentDir;

        while (tmpDir !== null) {
            path.push(tmpDir.name);
            tmpDir = tmpDir.parentDir;
        }

        const pathString = '/'.concat(path.reverse().join('/'));

        const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
        const readWriteBufferLength = this.mem.int[registerReadWriteBufferLength];

        for (let i = 0; i < Math.min(pathString.length, readWriteBufferLength - 1); i++) {
            this.mem.setInt(readWriteBufferAddress + i, pathString.charCodeAt(i));
        }
    }

    getFilesystemObjectType(index: number) {
        let type;
        switch (this.currentDirFsObjects[index].type) {
            case 'FILE':
                type = fsObjTypeFile;
                break;
            case 'DIRECTORY':
                type = fsObjTypeDirectory;
                break;
            case 'PROGRAM':
                type = fsObjTypeProgram;
                break;
            default:
                type = 0x00;
                break;
        }

        const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
        this.mem.setInt(readWriteBufferAddress, type);

        if (type === 0x00) {
            this.mem.setInt(commandReturnValue, returnValError);
        } else {
            this.mem.setInt(commandReturnValue, returnValSuccess);
        }
    }

    getFileSize(index: number) {
        switch (this.currentDirFsObjects[index].type) {
            case 'DIRECTORY':
                this.mem.setInt(commandReturnValue, returnValError);
                break;
            case 'FILE':
            case 'PROGRAM':
                const file = this.currentDirFsObjects[index] as File;
                const size = file.content.length;

                const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
                this.mem.setInt(readWriteBufferAddress, size & 0x00ff);
                this.mem.setInt(readWriteBufferAddress + 1, (size & 0xff00) >> 8);

                this.mem.setInt(commandReturnValue, returnValSuccess);
                break;
            default:
                break;
        }
    }
}

export class FilesystemObject {
    parentDir: Directory | null;
    name: string;
    type: 'FILE' | 'DIRECTORY' | 'PROGRAM';
    created: Date;
    changed: Date;

    constructor(parentDir: Directory | null, name: string, type: 'FILE' | 'DIRECTORY' | 'PROGRAM') {
        this.parentDir = parentDir;
        this.name = name;
        this.type = type;
        this.created = new Date();
        this.changed = this.created;
    }
}

export class File extends FilesystemObject {
    content: number[] = [];

    constructor(parentDir: Directory | null, name: string, content?: number[]) {
        super(parentDir, name, 'FILE');

        if (content) this.content = content;
    }
}

export class Directory extends FilesystemObject {
    fsObjects: FilesystemObject[];

    constructor(parentDir: Directory | null, name: string) {
        super(parentDir, name, 'DIRECTORY');

        this.fsObjects = [];
    }
}

export class Program extends FilesystemObject {
    loadAddress: number;
    content: number[] = [];

    constructor(parentDir: Directory | null, name: string, loadAddress: number, content?: number[]) {
        super(parentDir, name, 'PROGRAM');

        this.loadAddress = loadAddress;
        if (content) this.content = content;
    }
}
