import { configs } from "../configs";
import { logsConstants } from "../constants/logs";
import { Context } from "../types/Context";
import { intents } from "../types/intents";
import { areDatesInSameWeek, getFormattedDate } from "../util/dateHelpers";
import { getRandomFaceEmoji, getRandomIconEmoji } from "../util/emojiHelpers";
import { elogRed } from "../util/logHelper";
import { saveRotatingCircleGif } from "./rouletteWheelService";
import { CandidateService } from "../services/CandidateService";
import { ResponsibleService } from "../services/ResponsibleService";

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
    // elog("new entities = ", entities);
    context.conversation.entities = {
      ...context.conversation.entities,
      ...entities,
    };

    switch (context.conversation.entities.intent) {
      case intents.bye:
        return this.intentBye(context);
      case intents.select_random_responsible:
        return this.intentSelectResponsible(context);
      case intents.greeting:
        return this.intentGreeting(context);
      case intents.ask_candidates:
        return this.intentAskCandidates(context);
      case intents.add_new_candidate:
        return this.intentAddNewCandidate(context);
      case intents.add_new_responsible:
        return this.intentAddNewResponsible(context);
      case intents.ask_last_three_responsibles:
        return this.intentAskLastThreeResponsibles(context);
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

  static intentSelectResponsible = async (context: Context) => {
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

    const activeCandidates = await CandidateService.readActiveCandidates();

    const lastThreeResponsibles =
      await ResponsibleService.getLastThreeResponsible(neededRole, 3);

    const allCandidatesExceptLastThree = activeCandidates.filter((candidate) =>
      lastThreeResponsibles.every(
        (responsible) => responsible.candidate.id !== candidate.id
      )
    );

    allCandidatesExceptLastThree.sort(() => Math.random() - 0.5);
    const randomizedCandidateNames = allCandidatesExceptLastThree.map(
      (candidate) => candidate.name
    );
    const gifFileName = saveRotatingCircleGif(randomizedCandidateNames);
    const selectedResponsible = allCandidatesExceptLastThree[0];

    conversation.followUp =
      "Okay, I randomized the list of candidates as follow:\n" +
      allCandidatesExceptLastThree
        .map((c, i) => (i + 1).toString() + ". " + c.name)
        .join("\n") +
      "\n\nCongrats `" +
      selectedResponsible.name +
      "` " +
      getRandomFaceEmoji() +
      "\nNow you are the new `" +
      neededRole +
      "` " +
      getRandomIconEmoji();
    conversation.followUpFileName = gifFileName;

    ResponsibleService.addResponsibleIfExists(
      selectedResponsible.name,
      neededRole
    );

    context.log = logsConstants.selectRandomResponsible(
      selectedResponsible.name,
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

  static intentAskCandidates = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const candidates = await CandidateService.readActiveCandidates();

    if (!candidates.length) {
      conversation.followUp =
        "Currently no candidates. You can add some. :bulb:";
      return context;
    }

    conversation.followUp =
      "Here is the list of candidates: :point_down:\n" +
      candidates.map((c, i) => (i + 1).toString() + ". " + c.name).join("\n");
    return context;
  };

  static intentAddNewCandidate = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const newCandidateName =
      // conversation.entities.new_candidate;
      conversation.entities.candidate;

    if (!newCandidateName) {
      conversation.followUp =
        "Sorry, I didn't catch the name of the candidate. :pensive:\nCould you please rephrase it? ";
      return context;
    }

    const getAllCandidateNamesInStringList = async () => {
      const allCandidates = await CandidateService.readActiveCandidates();
      return (
        "Here is the list of all the candidates: :point_down:\n\t" +
        "`" +
        allCandidates.map((c) => c.name).join("`, `") +
        "`"
      );
    };

    const isDuplicate =
      (await CandidateService.readCandidateByName(newCandidateName)) !== null;
    if (isDuplicate) {
      conversation.followUp =
        "Sorry, `" +
        newCandidateName +
        "` is already in the candidates list. So no need to add it again. :no_entry_sign:\n" +
        (await getAllCandidateNamesInStringList());
      return context;
    }

    try {
      const saveResult = await CandidateService.addCandidate(newCandidateName);
    } catch (errorMessage) {
      elogRed("error in adding new candidate -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with adding " +
        newCandidateName +
        " to the candidates list. :x:\n" +
        errorMessage;
      return context;
    }
    conversation.followUp =
      "Okay, I added `" +
      newCandidateName +
      "` to the candidates list. :wink:\n" +
      (await getAllCandidateNamesInStringList());

    context.log = logsConstants.addNewUser(newCandidateName);

    return context;
  };

  static intentAddNewResponsible = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const newResponsibleName = conversation.entities.candidate;

    const newResponsibleRole = conversation.entities.role;

    if (!newResponsibleName) {
      conversation.followUp =
        "Sorry, I didn't catch the name of the responsible. :pensive:\nCould you please rephrase it?";
      return context;
    }

    try {
      const lastResponsible = await ResponsibleService.getLastResponsible(
        newResponsibleRole
      );
      if (
        areDatesInSameWeek(new Date(lastResponsible?.creationDate), new Date())
      ) {
        conversation.followUp =
          "Sorry, you can only add one " +
          newResponsibleRole +
          " per week :no_entry_sign:. the last " +
          newResponsibleRole +
          " was created on " +
          new Date(lastResponsible.creationDate).toLocaleDateString();
        return context;
      }

      const saveResult = await ResponsibleService.addResponsibleIfExists(
        newResponsibleName,
        newResponsibleRole
      );
    } catch (errorMessage) {
      elogRed("error in adding new responsible -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with adding " +
        newResponsibleName +
        " to the responsible list. :x:\n" +
        errorMessage;
      return context;
    }

    const lastThreeResponsibles =
      await ResponsibleService.getLastThreeResponsible(newResponsibleRole, 3);
    const lastThreeResponsiblesInStr = lastThreeResponsibles
      .map(
        (r) =>
          "`" +
          r.candidate.name +
          " (" +
          r.role.title +
          ")\t" +
          getFormattedDate(new Date(r.creationDate)) +
          "`"
      )
      .join("\n");

    conversation.followUp =
      "Okay, I added `" +
      newResponsibleName +
      "` to the `" +
      newResponsibleRole +
      "` list :star-struck:.\n" +
      lastThreeResponsiblesInStr;

    context.log = logsConstants.addNewResponsible(
      newResponsibleName,
      newResponsibleRole
    );
    return context;
  };

  static intentAskLastThreeResponsibles = async (context: Context) => {
    const { conversation } = context;
    if (!conversation) return;

    const askedResponsibleRole = conversation.entities.role;

    if (!askedResponsibleRole) {
      conversation.followUp =
        "Sorry, Which role do you want to see the last persons responsible for? :thinking_face:\nCould you please rephrase it?";
      return context;
    }

    try {
      const lastThreeResponsibles =
        await ResponsibleService.getLastThreeResponsible(
          askedResponsibleRole,
          3
        );

      if (lastThreeResponsibles.length === 0) {
        conversation.followUp = `Sorry, there is no ${askedResponsibleRole} registered yet in the list. :x:`;
        return context;
      }

      const lastThreeResponsiblesInStr =
        lastThreeResponsibles
          .map(
            (r) =>
              r.candidate.name +
              " (" +
              r.role.title +
              ")\t" +
              getFormattedDate(new Date(r.creationDate))
          )
          .join("`\n`") + "`";
      conversation.followUp =
        "Okay, Here are the last three " +
        askedResponsibleRole +
        "s: :point_down:\n`" +
        lastThreeResponsiblesInStr;
      return context;
    } catch (errorMessage) {
      elogRed("error in reading new responsibles -> ", errorMessage);
      conversation.followUp =
        "Sorry, there were a problem with reading the last three " +
        askedResponsibleRole +
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
