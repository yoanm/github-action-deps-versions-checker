declare module "Behavior" {
    import {PackageVersionDiff} from "PackageVersionDiffListCreator";
    export interface Behavior {
        execute: () => Promise<PackageVersionDiff[]>;
    }
}
