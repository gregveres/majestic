import { Resolver, Mutation, Arg, Query } from "type-graphql";
import * as launch from "launch-editor";
import { App } from "./app";
import FileWatcher, { WatcherEvents } from "../../services/file-watcher";
import { pubsub } from "../../event-emitter";
import { dirname, basename } from "path";

@Resolver(App)
export default class AppResolver {
  private appInstance: App;
  private fileWatcher: FileWatcher;

  constructor() {
    this.fileWatcher = new FileWatcher();
    this.appInstance = new App();
  }

  @Query(returns => App)
  app() {
    return this.appInstance;
  }

  @Mutation(returns => App)
  setSelectedFile(@Arg("path", { nullable: true }) path: string) {
    this.appInstance.selectedFile = path;

    if (path) {
      this.fileWatcher.watch(path);
      pubsub.publish(WatcherEvents.FILE_CHANGE, {
        id: WatcherEvents.FILE_CHANGE,
        payload: {
          path
        }
      });
    }

    return this.appInstance;
  }

  @Mutation(returns => String)
  openInEditor(@Arg("path") path: string) {
    launch(path, process.env.EDITOR || "code", (path: string, err: any) => {
      console.log("Failed to open file in editor. You may need to install the code command to your PATH if you are using VSCode: ", err);
    });

    return "";
  }

  @Mutation(returns => String)
  openSnapInEditor(@Arg("path") path: string) {
    var dir = dirname(path)
    var file = basename(path);

    var snap = dir + '/__snapshots__/' + file + '.snap'
    console.log("opening the snapshot:", snap);
    this.openInEditor(snap);

    return "";
  }
}
