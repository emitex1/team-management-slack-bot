-- SQLite
-- SELECT * from role

-- SELECT count(*) from candidate

-- SELECT * from supervisor LEFT OUTER JOIN role ON role.id = supervisor.roleId

SELECT candidate.name, candidate.lastName, supervisor.* from supervisor LEFT OUTER JOIN candidate ON candidate.id = supervisor.candidateId