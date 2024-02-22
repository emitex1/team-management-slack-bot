import { configs } from "../configs";
import { logsConstants } from "../constants/logs";
import { Context } from "../types/Context";
import { intents } from "../types/intents";
import { areDatesInSameWeek, getFormattedDate } from "../util/dateHelpers";
import { getRandomFaceEmoji, getRandomIconEmoji } from "../util/emojiHelpers";
import { elogRed } from "../util/logHelper";
import { saveRotatingCircleGif } from "./rouletteWheelService";
import { TeammateService } from "../services/TeammateService";
import { SupervisorService } from "../services/SupervisorService";

export class ConversationService {
  static run = async (text: string, context: Context, witService: any) => {
    if (!context.conversation) {
      context.conversation = {
        entities: {},
        followUp: "",
        complete: false,
        exit: false,
      };
    }

    if (!text) {
      context.conversation.followUp =
        "Hey " +
        context.slack.senderFirstName +
        ". I'm " +
        configs.slack.productName +
        ", You mentioned me. What can I do for you?";
      return context;
    }

    const entities = await witService.query(text);
    // elog("New entities from WIT = ", entities);
    context.conversation.entities = {
      ...context.conversation.entities,
      ...entities,
    };

    switch (context.conversation.entities.intent) {
      case intents.bye:
        return this.intentBye(context);
      case intents.select_random_supervisor:
        return this.intentSelectSupervisor(context);
      case intents.greeting:
        return this.intentGreeting(context);
      case intents.ask_teammates:
        return this.intentAskTeammates(context);
      case intents.add_new_teammate:
        return this.intentAddNewTeammate(context);
      case intents.add_new_user_as_teammate:
        return this.intentAddNewUserAsTeammate(context);
      case intents.add_new_supervisor:
        return this.intentAddNewSupervisor(context);
      case intents.ask_last_three_supervisors:
        return this.intentAskLastThreeSupervisors(context);
      default:
        return this.noPredefinedIntent(context);
    }
  };

  static intentBye = (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    conversation.followUp = "Okay, Bye :hand:";
    conversation.exit = true;
    return context;
  };

  static intentSelectSupervisor = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const { entities } = conversation;

    const neededRole = entities.role;
    // const selectType = entities.select_type;

    // if (!selectType) {
    //   conversation.followUp = "Do you want it to be a random selection?";
    //   return context;
    // }
    if (!neededRole) {
      conversation.followUp =
        "For which role do you need it to be run? :thinking_face:";
      return context;
    }

    const activeTeammates = await TeammateService.readActiveTeammates();

    const lastThreeSupervisors = await SupervisorService.getLastSupervisors(
      neededRole,
      3
    );

    const allTeammatesExceptLastThree = activeTeammates.filter((teammate) =>
      lastThreeSupervisors.every(
        (supervisor) => supervisor.teammate.id !== teammate.id
      )
    );

    allTeammatesExceptLastThree.sort(() => Math.random() - 0.5);
    const randomizedTeammateNames = allTeammatesExceptLastThree.map(
      (teammate) => teammate.name
    );
    const gifFileName = saveRotatingCircleGif(randomizedTeammateNames);
    const selectedSupervisor = allTeammatesExceptLastThree[0];

    conversation.followUp =
      "Okay, I randomized the list of teammates as follow:\n" +
      allTeammatesExceptLastThree
        .map((c, i) => (i + 1).toString() + ". " + c.name)
        .join("\n") +
      "\n\nCongrats " +
      "<@" +
      selectedSupervisor.userName +
      "> (`" +
      selectedSupervisor.name +
      "`) " +
      getRandomFaceEmoji() +
      "\nNow you are the new `" +
      neededRole +
      "` " +
      getRandomIconEmoji();
    conversation.followUpFileName = gifFileName;

    SupervisorService.addSupervisorIfExists(
      selectedSupervisor.name,
      neededRole
    );

    context.log = logsConstants.selectRandomSupervisor(
      selectedSupervisor.name,
      neededRole
    );

    // conversation.complete = true;
    return context;
  };

  static intentGreeting = (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    conversation.followUp = "Hello, How are you doing? :slightly_smiling_face:";
    return context;
  };

  static intentAskTeammates = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const teammates = await TeammateService.readActiveTeammates();

    if (!teammates.length) {
      conversation.followUp =
        "Currently no teammates. You can add some. :bulb:";
      return context;
    }

    conversation.followUp =
      "Here is the list of teammates: :point_down:\n" +
      teammates.map((c, i) => (i + 1).toString() + ". " + c.name).join("\n");
    return context;
  };

  static intentAddNewTeammate = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const newTeammateName =
      // conversation.entities.new_teammate;
      conversation.entities.teammate;

    if (!newTeammateName) {
      conversation.followUp =
        "Sorry, I didn't catch the name of the teammate. :pensive:\nCould you please rephrase it? ";
      return context;
    }

    const getAllTeammateNamesInStringList = async () => {
      const allTeammates = await TeammateService.readActiveTeammates();
      return (
        "Here is the list of all the teammates: :point_down:\n\t" +
        "`" +
        allTeammates.map((c) => c.name).join("`, `") +
        "`"
      );
    };

    const isDuplicate =
      (await TeammateService.readTeammateByName(newTeammateName)) !== null;
    if (isDuplicate) {
      conversation.followUp =
        "Sorry, `" +
        newTeammateName +
        "` is already in the teammates list. So no need to add it again. :no_entry_sign:\n" +
        (await getAllTeammateNamesInStringList());
      return context;
    }

    try {
      const saveResult = await TeammateService.addTeammate(newTeammateName);
    } catch (errorMessage) {
      elogRed("error in adding new teammate -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with adding " +
        newTeammateName +
        " to the teammates list. :x:\n" +
        errorMessage;
      return context;
    }
    conversation.followUp =
      "Okay, I added `" +
      newTeammateName +
      "` to the teammates list. :wink:\n" +
      (await getAllTeammateNamesInStringList());

    context.log = logsConstants.addNewUser(newTeammateName);

    return context;
  };

  static intentAddNewUserAsTeammate = async (context: Context) => {
    const { conversation, mention } = context;
    if (!conversation) return;

    if (!mention) {
      conversation.followUp =
        "Sorry, I didn't catch the name of the teammate. :pensive:\nCould you please rephrase it? ";
      return context;
    }

    const getAllTeammateNamesInStringList = async () => {
      const allTeammates = await TeammateService.readActiveTeammates();
      return (
        "Here is the list of all the teammates: :point_down:\n\t" +
        "`" +
        allTeammates.map((c) => c.name).join("`, `") +
        "`"
      );
    };

    const isDuplicate =
      (await TeammateService.readTeammateByName(mention.user.first_name!)) !==
      null;
    if (isDuplicate) {
      conversation.followUp =
        "Sorry, `" +
        mention.user.first_name +
        "` is already in the teammates list. So no need to add it again. :no_entry_sign:\n" +
        (await getAllTeammateNamesInStringList());
      return context;
    }

    try {
      await TeammateService.addTeammate(
        mention.user.first_name!,
        mention.user.title,
        mention.user.last_name,
        mention.memberId
        // mention.user.display_name,
        // mention.user.image_192,
      );
    } catch (errorMessage) {
      elogRed("error in adding new teammate -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with adding " +
        mention.user.first_name +
        " to the teammates list. :x:\n" +
        errorMessage;
      return context;
    }

    conversation.followUp =
      "Okay, I added `" +
      mention.user.real_name +
      "` to the teammates list. :wink:\n" +
      (await getAllTeammateNamesInStringList());

    context.log = logsConstants.addNewUser(mention.user.real_name!);

    return context;
  };

  static intentAddNewSupervisor = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const newSupervisorName = conversation.entities.teammate;

    const newSupervisorRole = conversation.entities.role;

    if (!newSupervisorName) {
      conversation.followUp =
        "Sorry, I didn't catch the name of the supervisor. :pensive:\nCould you please rephrase it?";
      return context;
    }

    try {
      const lastSupervisor = await SupervisorService.getLastSupervisor(
        newSupervisorRole
      );
      if (
        areDatesInSameWeek(new Date(lastSupervisor?.creationDate), new Date())
      ) {
        conversation.followUp =
          "Sorry, you can only add one " +
          newSupervisorRole +
          " per week :no_entry_sign:. the last " +
          newSupervisorRole +
          " was created on " +
          new Date(lastSupervisor.creationDate).toLocaleDateString();
        return context;
      }

      const saveResult = await SupervisorService.addSupervisorIfExists(
        newSupervisorName,
        newSupervisorRole
      );
    } catch (errorMessage) {
      elogRed("error in adding new supervisor -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with adding " +
        newSupervisorName +
        " to the supervisor list. :x:\n" +
        errorMessage;
      return context;
    }

    const lastThreeSupervisors = await SupervisorService.getLastSupervisors(
      newSupervisorRole,
      3
    );
    const lastThreeSupervisorsInStr = lastThreeSupervisors
      .map(
        (r) =>
          "`" +
          r.teammate.name +
          " (" +
          r.role.title +
          ")\t" +
          getFormattedDate(new Date(r.creationDate)) +
          "`"
      )
      .join("\n");

    conversation.followUp =
      "Okay, I added `" +
      newSupervisorName +
      "` to the `" +
      newSupervisorRole +
      "` list :star-struck:.\n" +
      lastThreeSupervisorsInStr;

    context.log = logsConstants.addNewSupervisor(
      newSupervisorName,
      newSupervisorRole
    );
    return context;
  };

  static intentAskLastThreeSupervisors = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const askedSupervisorRole = conversation.entities.role;

    if (!askedSupervisorRole) {
      conversation.followUp =
        "Sorry, Which role do you want to see the last persons supervisor for? :thinking_face:\nCould you please rephrase it?";
      return context;
    }

    try {
      const lastThreeSupervisors = await SupervisorService.getLastSupervisors(
        askedSupervisorRole,
        3
      );

      if (lastThreeSupervisors.length === 0) {
        conversation.followUp = `Sorry, there is no ${askedSupervisorRole} registered yet in the list. :x:`;
        return context;
      }

      const lastThreeSupervisorsInStr =
        lastThreeSupervisors
          .map(
            (r) =>
              r.teammate.name +
              " (" +
              r.role.title +
              ")\t" +
              getFormattedDate(new Date(r.creationDate))
          )
          .join("`\n`") + "`";
      conversation.followUp =
        "Okay, Here are the last three " +
        askedSupervisorRole +
        "s: :point_down:\n`" +
        lastThreeSupervisorsInStr;
      return context;
    } catch (errorMessage) {
      elogRed("error in reading new supervisors -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with reading the last three " +
        askedSupervisorRole +
        ". :x:\n" +
        errorMessage;
      return context;
    }
  };

  static noPredefinedIntent = (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    conversation.followUp = "Could you rephrase that? :thinking_face:";
    return context;
  };
}
