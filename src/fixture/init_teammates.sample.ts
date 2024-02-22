export const initTeammates = [
  {
    name: "Emad",
    lastName: "Armoun",
    title: "Mr.",
    slackMemberId: "U060V3UFFEX",
    displayName: "EmiTex",
    avatarUrl:
      "https://avatars.slack-edge.com/2023-10-12/6031678186084_d5ad0d0377b0b4bb7ed7_192.jpg",
    supervisors: [
      {
        creationDate: new Date("12.18.2023").getTime(),
        role: {
          title: "RoleA",
        },
      },
    ],
  },
  {
    name: "John",
    lastName: "Doe",
    title: "Mr.",
    slackMemberId: "U12345ABCDE",
    displayName: "Johny",
    supervisors: [
      {
        creationDate: new Date("12.18.2023").getTime(),
        role: {
          title: "RoleB",
        },
      },
    ],
  },
  {
    name: "John",
    lastName: "Smith",
    title: "Mr.",
    isActive: false,
  },
];
