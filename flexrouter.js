import {flexroute} from "./flexroute.js"

const flexrouter = ({options={},servers=[]}={}) => {
    return flexroute().withServers(options,...servers);
}

export {flexrouter, flexrouter as default}