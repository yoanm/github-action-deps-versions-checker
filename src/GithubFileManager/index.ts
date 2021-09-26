import {File} from "GithubApi";
import {getFile as getFileContent, getFileBetween} from "../github-api/contents";
import {getFile as getPRFile} from "../github-api/pulls";


export class GithubFileManager {
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;

    constructor(
        repositoryOwner: string,
        repositoryName: string
    ) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
    }

    public async getPRFile(filename: string, prNumber: number, fileStatusFilter: string[] | undefined = undefined): Promise<File | undefined> {
        // Get updated files from PR and not from last commit !
        // action has to be executed if any commit from the PR update the file, not only the last commit
        const file = await getPRFile(
            this.repositoryOwner,
            this.repositoryName,
            prNumber,
            filename
        );

        if (!file || !fileStatusFilter) {
            return file;
        }

        return (await this.filterFiles(filename, [file], fileStatusFilter)).pop();
    }

    public async getFileBetween(filename: string, baseSha: string, headSha: string, fileStatusFilter: string[] | undefined = undefined): Promise<File | undefined> {
        const file = await getFileBetween(
            this.repositoryOwner,
            this.repositoryName,
            baseSha,
            headSha,
            filename,
        );

        if (!file || !fileStatusFilter) {
            return file;
        }

        return (await this.filterFiles(filename, [file], fileStatusFilter)).pop();
    }

    public async filterFiles(filename: string, fileList: File[], fileStatusFilter: string[] | undefined = undefined): Promise<File[]> {
        const result = [];
        for (const file of fileList) {
            if (filename === file.filename && fileStatusFilter ? fileStatusFilter.includes(file.status) : true) {
                result.push(file);
            }
        }

        return result;
    }

    public async getFileContentAt(filename: string, commitSha: string): Promise<string | undefined> {
        const data = await getFileContent(this.repositoryOwner, this.repositoryName, filename, commitSha);
        if (data === undefined) {
            return undefined;
        }
        if (data.encoding !== 'base64') {
            throw new Error(`Expected base64 encoded file but received "${data.encoding}" !`);
        }

        return this.base64ContentToUTF8(data.content);
    }

    protected base64ContentToUTF8(content: string): string {
        return Buffer.from(content, 'base64')
            .toString('utf-8');
    }
}
