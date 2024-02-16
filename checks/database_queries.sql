-- SQLite
-- SELECT * from role

-- SELECT count(*) from teammate

-- SELECT * from supervisor LEFT OUTER JOIN role ON role.id = supervisor.roleId

SELECT teammate.name, teammate.lastName, supervisor.* from supervisor LEFT OUTER JOIN teammate ON teammate.id = supervisor.teammateId