import { raEdpoints } from "../../../enums/RAEndpoints.js";
import { request } from "../../http.js";


export async function getConsoleGameList({ apiKey, ID }) {
    const data = await request(raEdpoints.consoleGamesList, {
        y: apiKey,
        i: ID,  //console ID
        h: 0,    //with hashes
        f: 1,    //with cheevos
        c: 0,    //0-all, count
        o: 0,    //offset
    });

    return data;
}