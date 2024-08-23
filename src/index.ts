import { PROXY_SERVER } from "./proxy";
import { startAPIServer } from "./server";
import { FORKR_STATE } from "./state";
import {waitMs} from "./utils";
const INTRO_MESSAGE = "\n\x1B[8m⠀\x1B[0m⣤⣤⣤⡀\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m\n\x1B[8m⠀\x1B[0m⣿⣿⣿⣿⣦⡀\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m\n\x1B[8m⠀\x1B[0m⠈⠹⣿⣿⣿⣿⣦⡀\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m\n\x1B[8m⠀⠀⠀\x1B[0m⠈⠻⣿⣿⣿⣿⣦⡀\x1B[8m⠀⠀⠀⠀⠀⠀\x1B[0m⢀\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m        /\\ \\       /\\ \\         /\\ \\        /\x5C_\\           /\\ \\    \n\x1B[8m⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣿⣿⣿⣦⡀\x1B[8m⠀⠀\x1B[0m⢀⣴⣿⣷⣄\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m       /  \\ \\     /  \\ \\       /  \\ \\      / / /  _       /  \\ \\   \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣿⣿⣿⣦⣴⣿⠟⠉⠻⣿⣷⣄\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m      / /\\ \\ \\   / /\\ \\ \\     / /\\ \\ \\    / / /  /\x5C_\\    / /\\ \\ \\  \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣿⣿⣿⡁\x1B[8m⠀⠀⠀\x1B[0m⠈⠻⣿⣷⣄\x1B[8m⠀\x1B[0m⣀\x1B[8m⠀⠀⠀⠀\x1B[0m     / / /\\ \x5C_\\ / / /\\ \\ \\   / / /\\ \x5C_\\  / / /__/ / /   / / /\\ \x5C_\\ \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⢀⣴⣿⠟⠙⢿⣿⣦⡀\x1B[8m⠀⠀⠀\x1B[0m⠈⠻⣿⣿⣿⣆\x1B[8m⠀⠀⠀\x1B[0m    / /_/_ \\/_// / /  \\ \x5C_\\ / / /_/ / / / /\x5C_____/ /   / / /_/ / / \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⣴⣿⡟⠁\x1B[8m⠀⠀⠀\x1B[0m⠙⢿⣿⣆\x1B[8m⠀⠀\x1B[0m⠠⢾⣿⣿⣿⣿⣆\x1B[8m⠀⠀\x1B[0m   / /____/\\  / / /   / / // / /__\\/ / / /\x5C_______/   / / /__\\/ /  \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣦⡀\x1B[8m⠀⠀⠀⠀\x1B[0m⠙⢿⣷⣤⡀\x1B[8m⠀\x1B[0m⠈⠉⠛⠻⢿⡄\x1B[8m⠀\x1B[0m  / /\x5C____\\/ / / /   / / // / /_____/ / / /\\ \\ \\     / / /_____/   \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣦⡀\x1B[8m⠀⠀\x1B[0m⡀\x1B[8m⠀\x1B[0m⠙⢿⣿⣦⣾⣇\x1B[8m⠀⠀⠀⠀⠀\x1B[0m / / /      / / /___/ / // / /\\ \\ \\  / / /  \\ \\ \\   / / /\\ \\ \\     \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠻⣿⣦⣾⣷⡀\x1B[8m⠀\x1B[0m⣠⣿⣿⣿⣿⣆\x1B[8m⠀⠀⠀⠀\x1B[0m/ / /      / / /____\\/ // / /  \\ \\ \\/ / /    \\ \\ \\ / / /  \\ \\ \\    \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⢠⣿⣿⣿⣿⣧\x1B[8m⠀\x1B[0m⠉⠙⠻⢿⣿⣿⡄\x1B[8m⠀⠀⠀\x1B[0m\\/_/       \\/_________/ \\/_/    \x5C_\\/\\/_/      \x5C_\x5C_\\\\/_/    \x5C_\\/    \n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠈⠙⠻⢿⣿⣆\x1B[8m⠀⠀⠀⠀⠀\x1B[0m⠉⠁\x1B[8m⠀⠀⠀\x1B[0m\n\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m⠉\x1B[8m⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\x1B[0m\n\n\n";
async function runStart(containerId: string) {
  if(/[^a-f0-9]/.test(containerId) || containerId.length !== 12) {
    throw new Error('Invalid containerId, please run: `docker run -p 1337:1337 -it --rm qedprotocol/bitide-doge:latest`, and then `docker ps` to get the hexadecimal container ID');
  }
  console.log(INTRO_MESSAGE);
  await FORKR_STATE.activateDocker(containerId);
  console.log("activated");
  await waitMs(2000);
  const app = await startAPIServer();
  console.log("starting api server");
  app.listen(1449, ()=>{
    console.log("API listening on http://localhost:1449");
  });
}



runStart(process.argv[2]).catch(e=>{
  console.error(e);
  process.exit(1);
});