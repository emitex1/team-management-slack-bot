-- SQLite
-- SELECT * from role

-- SELECT count(*) from candidate

-- SELECT * from responsible LEFT OUTER JOIN role ON role.id = responsible.roleId

SELECT candidate.name, candidate.lastName, responsible.* from responsible LEFT OUTER JOIN candidate ON candidate.id = responsible.candidateId