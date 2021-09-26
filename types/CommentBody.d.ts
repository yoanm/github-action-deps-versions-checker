declare module "CommentBody" {
    import {PackageVersionDiff} from "PackageVersionDiffListCreator";

    export type TableRowDataProvider<T extends PackageVersionDiff> = (item: T) => string[];
}
