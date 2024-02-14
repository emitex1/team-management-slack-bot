import { MessageResponse, Wit, WitContext } from "node-wit";
import { elogRed } from "../util/logHelper";

type ExtractedDataType = {
  intent: string;
  [key: string]: string;
};

export const WitService = (accessToken: string) => {
  const client = new Wit({ accessToken });

  const query = async (text: string) => {
    const extractedData: ExtractedDataType = {} as ExtractedDataType;

    try {
      const queryResult: MessageResponse = await client.message(
        text,
        {} as WitContext
      );
      // elog("queryResult = ", queryResult);
      const { entities, intents } = queryResult;
      // elog("all intents = ", intents);
      if (intents[0].confidence > 0.6) {
        extractedData.intent = intents[0].name;
        Object.keys(entities).forEach((key: string) => {
          // elog("entity value=", entities[key]);
          if (entities[key][0].confidence > 0.7) {
            const entity = entities[key][0];
            extractedData[entity.name] = entity.body;
          }
        });
      }
    } catch (e) {
      elogRed("Error extracting entities", e);
    }
    // elog("extractedEntities -> ", extractedData);
    return extractedData;
  };

  return {
    query,
  };
};
