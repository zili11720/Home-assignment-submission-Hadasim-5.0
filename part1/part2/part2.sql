--part 2 Tables managment
--I used SQLite view https://sqliteonline.com/


-- for refference this is the create table command:
CREATE TABLE Person(
    Person_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Personal_Name TEXT NOT NULL,
    Family_Name TEXT NOT NULL,
    Gender TEXT CHECK (Gender IN ('Male', 'Female')),
    Father_Id INTEGER,
    Mother_Id INTEGER,
    Spouse_Id INTEGER,
    FOREIGN KEY (Father_Id) REFERENCES Person(Person_Id),
    FOREIGN KEY (Mother_Id) REFERENCES Person(Person_Id),
    FOREIGN KEY (Spouse_Id) REFERENCES Person(Person_Id)
);



-- exercise 1- first dagree relatives
CREATE TABLE FamilyTree AS

SELECT person_id, father_id AS Relative_Id, 'Father' AS Connection_Type
FROM person
WHERE father_id IS NOT NULL

UNION

SELECT person_id, mother_id, 'Mother'
FROM person
WHERE mother_id IS NOT NULL

UNION

SELECT p1.person_id, p2.person_id, 
       CASE WHEN p2.gender = 'Male' THEN 'Husband' ELSE 'Wife' END
FROM person p1
JOIN person p2 ON p1.spouse_id = p2.person_id

UNION

SELECT p1.person_id, p2.person_id,
       CASE WHEN p2.gender = 'Male' THEN 'Brother' ELSE 'Sister' END
FROM person p1
JOIN person p2 ON (p1.mother_id = p2.mother_id OR p1.father_id = p2.father_id)
WHERE p1.person_id <> p2.person_id

UNION

SELECT p1.person_id, p2.person_id,
       CASE WHEN p2.gender = 'Male' THEN 'Son' ELSE 'Daughter' END
FROM person p1
JOIN person p2 ON (p1.person_id = p2.father_id OR p1.person_id = p2.mother_id);


--exercise2
INSERT INTO FamilyTree (person_id, relative_id, connection_type)
SELECT f.relative_id, f.person_id, --insert the opposite connection
       CASE
           WHEN f.connection_type = 'Husband' THEN 'Wife'
           WHEN f.connection_type = 'Wife' THEN 'Husband'
       END
FROM FamilyTree f
WHERE f.connection_type IN ('Husband', 'Wife')
  AND NOT EXISTS ( --make sure the other direction doesn't exist
      SELECT 1
      FROM FamilyTree f2
      WHERE f2.person_id = f.relative_id
        AND f2.relative_id = f.person_id
        AND f2.connection_type IN ('Husband', 'Wife')
  );
