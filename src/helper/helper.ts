import { fileHelper } from "./fileHelper";
import { compileHelper } from "./compileHelper";

export class esac {
    public static get compile(){
        return compileHelper.instance;
    }
    public static get file(){
        return fileHelper.instance;
    }
}