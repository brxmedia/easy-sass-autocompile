import { fileHelper } from "./fileHelper";
import { compileHelper } from "./compileHelper";
import { statusBarUi } from "./satusBarUi";
import { messageHelper } from "./messageHelper";

export class esac {
    public static get compile(){
        return compileHelper.instance;
    }
    public static get file(){
        return fileHelper.instance;
    }
    public static get satusBar(){
        return statusBarUi;
    }
    public static get message(){
        return messageHelper;
    }
}