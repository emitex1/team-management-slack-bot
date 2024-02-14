export const getRandomFaceEmoji = () => {
  const faceEmojis = [
    ":sweat_smile:",
    ":wink:",
    ":star-struck:",
    ":partying_face:",
  ];
  return faceEmojis[Math.floor(Math.random() * faceEmojis.length)];
};

export const getRandomIconEmoji = () => {
  const happyIconEmojis = [":100:", ":+1:", ":handshake:", ":tada:"];
  return happyIconEmojis[Math.floor(Math.random() * happyIconEmojis.length)];
};
