import Memory from './Memory';

const registerReadWriteBuffer = 0x0217;
//const registerReadWriteBufferLength = 0x0219;
const registerCommandBuffer = 0x021a;
const registerCommandBufferLength = 0x021c;
const registerCommandFlow = 0x021f;
const commandFlowReady = 0xe1;
const commandFlowInProgess = 0x99;
const commandFlowDone = 0x87;
const commandReturnValue = 0x021d;

export class Storage {
    private mem: Memory;
    fsObjects: FilesystemObject[];
    currentDir: FilesystemObject[];

    constructor(mem: Memory) {
        this.mem = mem;

        this.fsObjects = [];

        this.currentDir = this.fsObjects;
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
                    default:
                        break;
                }

                this.mem.setInt(registerCommandFlow, commandFlowDone);
            }
        }
    }

    getFilesystemObjectsCount() {
        this.mem.setInt(commandReturnValue, this.currentDir.length);
    }

    getFilesystemObjectName(index: number) {
        const name = this.currentDir[index].name;

        const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];

        for (let i = 0; i < name.length; i++) {
            this.mem.setInt(readWriteBufferAddress + i, name.charCodeAt(i));
        }
    }

    getFilesystemObjectType(index: number) {
        let type;
        switch (this.currentDir[index].type) {
            case 'FILE':
                type = 0x99;
                break;
            case 'DIRECTORY':
                type = 0xe1;
                break;
            case 'PROGRAM':
                type = 0x87;
                break;
            default:
                type = 0x00;
                break;
        }

        const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
        this.mem.setInt(readWriteBufferAddress, type);

        if (type === 0x00) {
            this.mem.setInt(commandReturnValue, 0x00);
        } else {
            this.mem.setInt(commandReturnValue, 0xff);
        }
    }

    getFileSize(index: number) {
        switch (this.currentDir[index].type) {
            case 'DIRECTORY':
                this.mem.setInt(commandReturnValue, 0x00);
                break;
            case 'FILE':
            case 'PROGRAM':
                const file = this.currentDir[index] as File;
                const size = file.content.length;

                const readWriteBufferAddress = this.mem.int[registerReadWriteBuffer + 1] * 256 + this.mem.int[registerReadWriteBuffer];
                this.mem.setInt(readWriteBufferAddress, size & 0x00ff);
                this.mem.setInt(readWriteBufferAddress + 1, (size & 0xff00) >> 8);

                this.mem.setInt(commandReturnValue, 0xff);
                break;
            default:
                break;
        }
    }
}

export class FilesystemObject {
    path: string[];
    name: string;
    type: 'FILE' | 'DIRECTORY' | 'PROGRAM';
    created: Date;
    changed: Date;

    constructor(path: string[], name: string, type: 'FILE' | 'DIRECTORY' | 'PROGRAM') {
        this.path = path;
        this.name = name;
        this.type = type;
        this.created = new Date();
        this.changed = this.created;
    }
}

export class File extends FilesystemObject {
    content: number[] = [];

    constructor(path: string[], name: string, content?: number[]) {
        super(path, name, 'FILE');

        if (content) this.content = content;
    }
}

export class Directory extends FilesystemObject {
    fsObjects: FilesystemObject[];

    constructor(path: string[], name: string) {
        super(path, name, 'DIRECTORY');

        this.fsObjects = [];
    }
}

export class Program extends FilesystemObject {
    loadAddress: number;
    content: number[] = [];

    constructor(path: string[], name: string, loadAddress: number, content?: number[]) {
        super(path, name, 'PROGRAM');

        this.loadAddress = loadAddress;
        if (content) this.content = content;
    }
}
