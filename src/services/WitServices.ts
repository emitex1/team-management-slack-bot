import { MessageResponse, Wit, WitContext } from "node-wit";

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
      // console.log("queryResult = ", queryResult);
      const { entities, intents } = queryResult;
      // console.log("all intents = ", intents);
      if (intents[0].confidence > 0.6) {
        extractedData.intent = intents[0].name;
        Object.keys(entities).forEach((key: string) => {
          // console.log("entity value=", entities[key]);
          if (entities[key][0].confidence > 0.7) {
            const entity = entities[key][0];
            extractedData[entity.name] = entity.body;
          }
        });
      }
    } catch (e) {
      console.log("Error extracting entities", e);
    }
    // console.log("extractedEntities -> ", extractedData);
    return extractedData;
  };

  return {
    query,
  };
};
