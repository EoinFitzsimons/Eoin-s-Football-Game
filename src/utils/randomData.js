// worldFootballData.js - Generate comprehensive fictional football world with 10 countries
import { Player } from '../player/player.js';
import { Team } from '../team/team.js';
import { League } from '../league/league.js';

// World Football System - 10 Countries, 3 Leagues Each
const WORLD_FOOTBALL_DATA = {
  countries: {
    'England': {
      leagues: [
        { name: 'Premier Division', tier: 1, teams: 20 },
        { name: 'Championship', tier: 2, teams: 24 },
        { name: 'League One', tier: 3, teams: 24 }
      ],
      cities: ['London', 'Manchester', 'Liverpool', 'Birmingham', 'Leeds', 'Sheffield', 'Newcastle', 'Bristol', 'Coventry', 'Leicester', 'Nottingham', 'Portsmouth', 'Southampton', 'Brighton', 'Norwich', 'Derby', 'Hull', 'Middlesbrough', 'Burnley', 'Blackburn', 'Preston', 'Oldham', 'Rochdale', 'Wigan'],
      teamSuffixes: ['United', 'City', 'Town', 'FC', 'Rovers', 'Wanderers', 'Athletic', 'Albion'],
      playerNames: {
        first: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Patrick', 'Frank', 'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Henry', 'Adam', 'Douglas', 'Nathan', 'Peter', 'Zachary', 'Kyle', 'Ethan', 'Oliver', 'Harry', 'Charlie', 'Jacob', 'Leo', 'Mason', 'Lucas', 'Alexander', 'Liam', 'Noah', 'William', 'Logan', 'Elijah', 'Aiden', 'Caden', 'Grayson', 'Jackson', 'Hunter', 'Connor', 'Caleb', 'Sebastian', 'Jack', 'Luke', 'Owen', 'Dylan', 'Isaac', 'Nathan', 'Mason', 'Cole', 'Eli', 'Blake', 'Austin', 'Carter', 'Hayden', 'Jaxon', 'Ryder', 'Cooper', 'Ian', 'Oscar', 'Declan', 'Felix', 'Kai', 'Theo', 'Max', 'Finn', 'Archie', 'Harrison', 'Hugo', 'Alfred', 'Arthur', 'Freddie', 'Albert', 'Stanley', 'Alfie', 'Toby', 'Louis', 'George', 'Ralph', 'Frederick', 'Sidney', 'Ernest', 'Walter', 'Percy', 'Herbert', 'Harold', 'Claude', 'Arthur', 'Wilfred', 'Edgar', 'Bernard', 'Roy', 'Frank', 'Leonard', 'Horace', 'Victor', 'Cecil'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Cooper', 'Reed', 'Evans', 'Murphy', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Bailey', 'Ward', 'Turner', 'Phillips', 'Parker', 'Morris', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'McDonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos', 'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt', 'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson', 'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson']
      }
    },
    'Spain': {
      leagues: [
        { name: 'Primera División', tier: 1, teams: 20 },
        { name: 'Segunda División', tier: 2, teams: 22 },
        { name: 'Segunda B', tier: 3, teams: 20 }
      ],
      cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Gijón', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Granada', 'Oviedo', 'Pamplona', 'Santander', 'Toledo', 'Burgos', 'León', 'Salamanca'],
      teamSuffixes: ['CF', 'FC', 'CD', 'UD', 'Real', 'Atlético'],
      playerNames: {
        first: ['Alejandro', 'Pablo', 'Hugo', 'Daniel', 'Diego', 'Javier', 'Marcos', 'Adrian', 'Sergio', 'Raul', 'Carlos', 'Miguel', 'Antonio', 'Manuel', 'Francisco', 'José', 'Juan', 'Pedro', 'Luis', 'Fernando', 'Roberto', 'Ricardo', 'Eduardo', 'Andrés', 'Gonzalo', 'Rafael', 'Álvaro', 'Ángel', 'Mario', 'Ignacio', 'Víctor', 'Emilio', 'Rubén', 'Iván', 'César', 'Joaquín', 'Óscar', 'Patricio', 'Lorenzo', 'Agustín', 'Salvador', 'Rodrigo', 'Nicolás', 'Tomás', 'Gabriel', 'Mateo', 'Lucas', 'Leo', 'Bruno', 'Martín', 'Sebastián', 'Santiago', 'Valentín', 'Thiago', 'Gael', 'Iker', 'Unai', 'Aitor', 'Jon', 'Mikel', 'Asier', 'Gorka', 'Eneko', 'Andoni', 'Iñaki', 'Xabi', 'Miquel', 'Jordi', 'Marc', 'Pau', 'Oriol', 'Roger', 'Gerard', 'Pol', 'Jan', 'Arnau', 'Biel'],
        last: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Nuñez', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez', 'Cruz', 'Gallego', 'Vidal', 'León', 'Herrera', 'Peña', 'Flores', 'Cabrera', 'Campos', 'Vega', 'Fuentes', 'Carrasco', 'Diez', 'Reyes', 'Caballero', 'Nieto', 'Aguilar', 'Pascual', 'Herrero', 'Montero', 'Lorenzo', 'Hidalgo', 'Giménez', 'Vargas', 'Ibáñez', 'Calvo', 'Ferrer', 'Marti', 'Vila', 'Roca', 'Pons', 'Serra', 'Soler', 'Llopis', 'Company']
      }
    },
    'Germany': {
      leagues: [
        { name: '1. Bundesliga', tier: 1, teams: 18 },
        { name: '2. Bundesliga', tier: 2, teams: 18 },
        { name: '3. Liga', tier: 3, teams: 20 }
      ],
      cities: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Bremen', 'Dresden', 'Hannover', 'Leipzig', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Augsburg', 'Chemnitz'],
      teamSuffixes: ['FC', 'SV', 'VfB', 'VfL', 'FSV', 'TSV', 'Borussia'],
      playerNames: {
        first: ['Leon', 'Paul', 'Jonas', 'Elias', 'Finn', 'Noah', 'Luis', 'Felix', 'Emil', 'Max', 'Moritz', 'Jakob', 'Anton', 'Luca', 'David', 'Ben', 'Tim', 'Jan', 'Tom', 'Nico', 'Alexander', 'Michael', 'Christian', 'Daniel', 'Thomas', 'Andreas', 'Stefan', 'Patrick', 'Markus', 'Matthias', 'Florian', 'Sebastian', 'Oliver', 'Tobias', 'Jörg', 'Marco', 'Martin', 'Peter', 'Thorsten', 'Jens', 'Klaus', 'Uwe', 'Frank', 'Ralf', 'Wolfgang', 'Bernd', 'Holger', 'Dieter', 'Hans', 'Günter', 'Karl', 'Heinz', 'Gerhard', 'Helmut', 'Walter', 'Rudolf', 'Hermann', 'Friedrich', 'Gustav', 'Otto', 'Wilhelm', 'Heinrich', 'Ludwig', 'Franz', 'Johann', 'Georg', 'Joseph', 'Ernst', 'Bruno', 'Kurt', 'Arthur', 'Paul', 'Albert', 'Richard', 'Robert', 'Willy', 'Fritz', 'Theodor', 'Josef', 'Adolf'],
        last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Schubert', 'Vogel', 'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth', 'Beck', 'Lorenz', 'Baumann', 'Franke', 'Albrecht', 'Boehm', 'Winter', 'Kraus', 'Martin', 'Schumacher', 'Krämer', 'Vogt', 'Stein', 'Jäger', 'Otto', 'Sommer', 'Groß', 'Seidel', 'Heinrich', 'Brandt', 'Haas', 'Schreiber', 'Graf', 'Schulte', 'Dietrich', 'Ziegler', 'Kuhn', 'Kühn', 'Pohl', 'Engel', 'Horn', 'Busch', 'Bergmann', 'Thomas', 'Voigt', 'Sauer', 'Arnold', 'Wolff', 'Pfeiffer']
      }
    },
    'Italy': {
      leagues: [
        { name: 'Serie A', tier: 1, teams: 20 },
        { name: 'Serie B', tier: 2, teams: 20 },
        { name: 'Serie C', tier: 3, teams: 20 }
      ],
      cities: ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia', 'Parma', 'Modena', 'Reggina', 'Livorno', 'Pisa', 'Perugia'],
      teamSuffixes: ['FC', 'AC', 'US', 'AS', 'SS', 'Calcio'],
      playerNames: {
        first: ['Alessandro', 'Matteo', 'Lorenzo', 'Andrea', 'Francesco', 'Marco', 'Davide', 'Luca', 'Gabriele', 'Riccardo', 'Simone', 'Federico', 'Antonio', 'Giuseppe', 'Stefano', 'Roberto', 'Paolo', 'Giovanni', 'Nicola', 'Michele'],
        last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti']
      }
    },
    'France': {
      leagues: [
        { name: 'Ligue 1', tier: 1, teams: 20 },
        { name: 'Ligue 2', tier: 2, teams: 20 },
        { name: 'National', tier: 3, teams: 18 }
      ],
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Limoges', 'Metz', 'Nancy'],
      teamSuffixes: ['FC', 'SC', 'AC', 'AS', 'RC', 'LOSC'],
      playerNames: {
        first: ['Lucas', 'Hugo', 'Louis', 'Jules', 'Arthur', 'Leo', 'Nathan', 'Gabriel', 'Theo', 'Mathis', 'Antoine', 'Pierre', 'Nicolas', 'Alexandre', 'Thomas', 'Maxime', 'Julien', 'Kevin', 'Romain', 'Florian'],
        last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Lefevre', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent']
      }
    },
    'Netherlands': {
      leagues: [
        { name: 'Eredivisie', tier: 1, teams: 18 },
        { name: 'Eerste Divisie', tier: 2, teams: 20 },
        { name: 'Tweede Divisie', tier: 3, teams: 18 }
      ],
      cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Den Haag', 'Amersfoort', 'Maastricht', 'Dordrecht', 'Leiden', 'Zwolle', 'Deventer'],
      teamSuffixes: ['FC', 'PSV', 'Ajax', 'AZ', 'SC', 'VVV', 'RKC'],
      playerNames: {
        first: ['Daan', 'Sem', 'Milan', 'Levi', 'Bram', 'Lars', 'Finn', 'Jesse', 'Luuk', 'Thijs', 'Noah', 'Liam', 'Noud', 'Siem', 'Koen', 'Gijs', 'Stijn', 'Mees', 'Joep', 'Cas', 'Sven', 'Jayden', 'Tim', 'Max', 'Ruben', 'Olivier', 'Mats', 'Teun', 'Hugo', 'Sebastiaan', 'Jens', 'Thomas', 'Sam', 'Niels', 'Ryan', 'Guus', 'Floris', 'Quinten', 'David', 'Nathan', 'Morris', 'Jason', 'Benjamin', 'Dean', 'Pepijn', 'Fabian', 'Damian', 'Robin', 'Wouter', 'Jordy', 'Timo', 'Jop', 'Jayden', 'Bas', 'Dex', 'Lex', 'Owen', 'Mick', 'Stan', 'Felix', 'Ties'],
        last: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'van Dijk', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Wit', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Groot', 'van der Berg', 'Willems', 'van der Meer', 'de Vos', 'Hoekstra', 'van der Laan', 'Jacobs', 'de Haan', 'van der Pol', 'de Koning', 'van der Ven', 'Koster', 'van der Wal', 'Huisman', 'van Veen', 'Vermeulen', 'van den Heuvel', 'van der Heide', 'Zijlstra', 'van der Meulen', 'Scholten', 'van Es', 'Postma', 'Boer', 'Koning', 'Brink', 'van Dam', 'Wit', 'Berg', 'Groot']
      }
    },
    'Portugal': {
      leagues: [
        { name: 'Primeira Liga', tier: 1, teams: 18 },
        { name: 'Liga de Honra', tier: 2, teams: 18 },
        { name: 'Segunda Liga', tier: 3, teams: 16 }
      ],
      cities: ['Lisboa', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém', 'Queluz', 'Rio Tinto', 'Barreiro', 'Montijo', 'Faro', 'Aveiro', 'Viseu', 'Guimarães', 'Évora', 'Leiria'],
      teamSuffixes: ['FC', 'SC', 'CD', 'CF', 'AC'],
      playerNames: {
        first: ['João', 'Rodrigo', 'Martim', 'Santiago', 'Tomás', 'Afonso', 'Francisco', 'Miguel', 'Rafael', 'Gabriel', 'António', 'Gonçalo', 'Diogo', 'Pedro', 'Tiago', 'Bruno', 'André', 'Carlos', 'José', 'Manuel', 'Luís', 'Paulo', 'Rui', 'Nuno', 'Sérgio', 'Hugo', 'Marco', 'Vítor', 'Ricardo', 'Fernando', 'Daniel', 'Nelson', 'Mário', 'Jorge', 'Alexandre', 'Filipe', 'Hélder', 'Fábio', 'César', 'Renato', 'Armando', 'Leonardo', 'Cristiano', 'Bernardo', 'Samuel', 'Henrique', 'Márcio', 'Eduardo', 'Vasco', 'Ivo'],
        last: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Martins', 'Rodrigues', 'Sousa', 'Fernandes', 'Gomes', 'Lopes', 'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira', 'Correia', 'Mendes', 'Nunes', 'Soares', 'Vieira', 'Monteiro', 'Cardoso', 'Rocha', 'Neves', 'Coelho', 'Cruz', 'Cunha', 'Pires', 'Ramos', 'Reis', 'Simões', 'Antunes', 'Matos', 'Fonseca', 'Machado', 'Guerreiro', 'Dias', 'Campos', 'Freitas', 'Barbosa', 'Carneiro', 'Lima', 'Miranda', 'Tavares', 'Esteves']
      }
    },
    'Brazil': {
      leagues: [
        { name: 'Série A', tier: 1, teams: 20 },
        { name: 'Série B', tier: 2, teams: 20 },
        { name: 'Série C', tier: 3, teams: 20 }
      ],
      cities: ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Brasília', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Campo Grande', 'Natal', 'Teresina', 'São Bernardo'],
      teamSuffixes: ['FC', 'EC', 'SC', 'AC', 'CR', 'SE'],
      playerNames: {
        first: ['Lucas', 'Gabriel', 'Matheus', 'Pedro', 'Guilherme', 'Rafael', 'Felipe', 'Gustavo', 'Vinicius', 'Daniel', 'João', 'Rodrigo', 'Bruno', 'Leonardo', 'André', 'Carlos', 'Diego', 'Fernando', 'Igor', 'Caio'],
        last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Barbosa', 'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Carvalho', 'Machado', 'Ribeiro', 'Martins', 'Araújo']
      }
    },
    'Argentina': {
      leagues: [
        { name: 'Primera División', tier: 1, teams: 28 },
        { name: 'Primera B Nacional', tier: 2, teams: 25 },
        { name: 'Primera B', tier: 3, teams: 20 }
      ],
      cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'La Plata', 'Mar del Plata', 'Quilmes', 'Tucumán', 'Salta', 'Santa Fe', 'Corrientes', 'Bahía Blanca', 'Resistencia', 'Paraná', 'Posadas', 'Neuquén', 'Santiago del Estero', 'La Rioja', 'Río Cuarto', 'Tandil', 'San Juan', 'Mendoza', 'San Luis'],
      teamSuffixes: ['FC', 'CA', 'Club', 'RC', 'AC'],
      playerNames: {
        first: ['Mateo', 'Santiago', 'Thiago', 'Bautista', 'Benjamín', 'Juan', 'Tomás', 'Francisco', 'Agustín', 'Lautaro', 'Nicolás', 'Emiliano', 'Facundo', 'Joaquín', 'Ignacio', 'Valentín', 'Máximo', 'Santino', 'Luciano', 'Bruno'],
        last: ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Sánchez', 'Romero', 'Sosa', 'Contreras', 'Silva', 'Vargas', 'Castillo', 'Gutiérrez', 'Rojas', 'Herrera', 'Medina', 'Morales']
      }
    },
    'Mexico': {
      leagues: [
        { name: 'Liga MX', tier: 1, teams: 18 },
        { name: 'Liga de Expansión MX', tier: 2, teams: 12 },
        { name: 'Segunda División', tier: 3, teams: 15 }
      ],
      cities: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Naucalpan', 'Mérida', 'Aguascalientes', 'Cuernavaca', 'Saltillo', 'Hermosillo', 'Culiacán', 'Chihuahua', 'Tampico', 'Morelia', 'Reynosa', 'Torreón', 'Querétaro', 'Toluca'],
      teamSuffixes: ['FC', 'CF', 'AC', 'CD', 'Club'],
      playerNames: {
        first: ['Santiago', 'Mateo', 'Diego', 'Emiliano', 'Daniel', 'Sebastián', 'Alejandro', 'Leonardo', 'Matías', 'Nicolás', 'Gabriel', 'Samuel', 'David', 'Ángel', 'José', 'Luis', 'Carlos', 'Fernando', 'Manuel', 'Antonio'],
        last: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez', 'Jiménez', 'Ruiz', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero']
      }
    }
  }
};

// Squad structure for realistic team composition
const SQUAD_STRUCTURE = {
  positions: [
    { position: 'GK', count: 3, tier1_min: 75, tier2_min: 65, tier3_min: 55 },
    { position: 'RB', count: 2, tier1_min: 70, tier2_min: 60, tier3_min: 50 },
    { position: 'LB', count: 2, tier1_min: 70, tier2_min: 60, tier3_min: 50 },
    { position: 'CB', count: 4, tier1_min: 72, tier2_min: 62, tier3_min: 52 },
    { position: 'DM', count: 2, tier1_min: 71, tier2_min: 61, tier3_min: 51 },
    { position: 'CM', count: 3, tier1_min: 73, tier2_min: 63, tier3_min: 53 },
    { position: 'AM', count: 2, tier1_min: 74, tier2_min: 64, tier3_min: 54 },
    { position: 'RW', count: 2, tier1_min: 72, tier2_min: 62, tier3_min: 52 },
    { position: 'LW', count: 2, tier1_min: 72, tier2_min: 62, tier3_min: 52 },
    { position: 'ST', count: 3, tier1_min: 75, tier2_min: 65, tier3_min: 55 }
  ]
};

// Team color schemes
const TEAM_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
  '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3',
  '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb'
];

/**
 * Generate comprehensive football world database
 */
export function generateWorldFootballSystem() {
  const worldSystem = {
    countries: [],
    allTeams: [],
    allPlayers: []
  };

  for (const [countryName, countryData] of Object.entries(WORLD_FOOTBALL_DATA.countries)) {
    const country = {
      name: countryName,
      leagues: [],
      teams: []
    };

    // Generate leagues for this country
    let usedCities = [...countryData.cities];
    let colorIndex = 0;

    for (const leagueData of countryData.leagues) {
      // Create teams for this league first
      const leagueTeams = [];
      
      for (let i = 0; i < leagueData.teams; i++) {
        const cityIndex = Math.floor(Math.random() * usedCities.length);
        const city = usedCities[cityIndex];
        usedCities.splice(cityIndex, 1);

        if (usedCities.length === 0) {
          usedCities = [...countryData.cities]; // Refill if we run out
        }

        const suffix = countryData.teamSuffixes[Math.floor(Math.random() * countryData.teamSuffixes.length)];
        const teamName = `${city} ${suffix}`;
        const teamColor = TEAM_COLORS[colorIndex % TEAM_COLORS.length];
        colorIndex++;

        const players = generateSquad(countryData.playerNames, leagueData.tier, countryName);
        const foundedYear = Math.floor(Math.random() * 120) + 1900; // 1900-2020
        
        const team = new Team({
          name: teamName,
          city: city,
          country: countryName,
          league: leagueData.name,
          tier: leagueData.tier,
          founded: foundedYear,
          color: teamColor,
          players: players,
          stats: {
            played: 0, won: 0, drawn: 0, lost: 0,
            goalsFor: 0, goalsAgainst: 0, points: 0
          }
        });

        leagueTeams.push(team);
        country.teams.push(team);
        worldSystem.allTeams.push(team);
        worldSystem.allPlayers.push(...players);
      }

      // Create League instance with the teams
      const league = new League({
        name: leagueData.name,
        teams: leagueTeams
      });
      
      // Add additional properties
      league.tier = leagueData.tier;
      league.promotionSpots = leagueData.tier === 1 ? 0 : (leagueData.tier === 2 ? 3 : 3);
      league.relegationSpots = leagueData.tier === 3 ? 0 : (leagueData.tier === 1 ? 3 : 3);

      country.leagues.push(league);
    }

  worldSystem.countries.push(country);
  }

  return worldSystem;
}

/**
 * Generate realistic squad for team based on league tier
 */
function generateSquad(nameData, tier, nationality) {
  const players = [];
  
  for (const positionData of SQUAD_STRUCTURE.positions) {
    for (let i = 0; i < positionData.count; i++) {
      const player = generatePlayer(nameData, positionData.position, tier, nationality);
      players.push(player);
    }
  }

  // Ensure we have exactly 25 players (standard squad size)
  while (players.length < 25) {
    const randomPos = SQUAD_STRUCTURE.positions[Math.floor(Math.random() * SQUAD_STRUCTURE.positions.length)];
    const player = generatePlayer(nameData, randomPos.position, tier, nationality);
    players.push(player);
  }

  return players.slice(0, 25); // Cap at 25 players
}

/**
 * Generate individual player with realistic attributes
 */
function generatePlayer(nameData, position, tier, nationality) {
  const firstName = nameData.first[Math.floor(Math.random() * nameData.first.length)];
  const lastName = nameData.last[Math.floor(Math.random() * nameData.last.length)];
  const fullName = `${firstName} ${lastName}`;

  // Age distribution based on position
  const ageRanges = {
    'GK': [22, 35], // Goalkeepers tend to be older
    'CB': [20, 33], // Centre-backs mature later
    'default': [17, 32] // Other positions
  };
  const ageRange = ageRanges[position] || ageRanges.default;
  const age = Math.floor(Math.random() * (ageRange[1] - ageRange[0] + 1)) + ageRange[0];

  // Generate attributes based on position and tier
  const attributes = generateRealisticAttributes(position, tier, age);

  return new Player({
    name: fullName,
    age: age,
    position: position,
    nationality: nationality,
    attributes: attributes,
    traits: generateTraits(position, attributes),
    value: calculatePlayerValue(attributes, age, tier),
    wage: calculatePlayerWage(attributes, age, tier)
  });
}

/**
 * Generate realistic attributes based on position, tier, and age
 */
function generateRealisticAttributes(position, tier, age) {
  // Base attribute ranges by tier
  const tierRanges = {
    1: { min: 65, max: 95 }, // Top tier
    2: { min: 55, max: 85 }, // Second tier  
    3: { min: 45, max: 75 }  // Third tier
  };

  const range = tierRanges[tier];
  const attributes = {};

  // Get base attributes structure
  const baseAttributes = Player.initAttributes();

  // Age effects
  const agePeak = 27;
  const ageEffect = age <= agePeak ? 
    0.8 + (age - 17) * 0.02 : // Young players grow
    1.0 - (age - agePeak) * 0.015; // Older players decline

  for (const attrName of Object.keys(baseAttributes)) {
    let baseValue;

    if (position === 'GK') {
      // Goalkeeper-specific attributes
      if (attrName.startsWith('gk')) {
        baseValue = range.min + Math.random() * (range.max - range.min);
      } else if (['pace', 'acceleration', 'sprint_speed'].includes(attrName)) {
        baseValue = range.min * 0.7 + Math.random() * (range.max * 0.7 - range.min * 0.7);
      } else {
        baseValue = range.min * 0.5 + Math.random() * (range.max * 0.6 - range.min * 0.5);
      }
    } else {
      // Outfield player attributes
      if (attrName.startsWith('gk')) {
        baseValue = 1 + Math.random() * 10; // Very low GK stats for outfield
      } else {
        // Position-specific bonuses
        const positionBonuses = getPositionAttributeBonuses(position);
        const bonus = positionBonuses[attrName] || 0;
        baseValue = range.min + Math.random() * (range.max - range.min) + bonus;
      }
    }

    // Apply age effect
    const finalValue = Math.max(1, Math.min(99, Math.round(baseValue * ageEffect)));
    attributes[attrName] = finalValue;
  }

  return attributes;
}

/**
 * Position-specific attribute bonuses
 */
function getPositionAttributeBonuses(position) {
  const bonuses = {
    'CB': { 
      // Defensive attributes
      marking: 8, tackling: 8, positioning: 6, strength: 6, bravery: 5,
      concentration: 5, interceptions: 4, clearance: 6, aerialduel: 8,
      heading: 6, anticipationdef: 5, block: 4, stand: 5,
      // Reduce attacking attributes
      pace: -5, acceleration: -3, dribbling: -8, finishing: -10, flair: -5
    },
    'RB': { 
      pace: 6, acceleration: 6, stamina: 6, crossing: 5, crossingearly: 4,
      crossinglate: 4, agility: 4, balance: 3, workrate: 5, recoveryrun: 5,
      // Some defensive abilities
      tackling: 3, marking: 2, positioning: 3
    },
    'LB': { 
      pace: 6, acceleration: 6, stamina: 6, crossing: 5, crossingearly: 4,
      crossinglate: 4, agility: 4, balance: 3, workrate: 5, recoveryrun: 5,
      // Some defensive abilities  
      tackling: 3, marking: 2, positioning: 3
    },
    'DM': { 
      tackling: 6, marking: 5, positioning: 6, interceptions: 7, workrate: 6,
      passing: 4, passingshort: 4, discipline: 5, concentration: 4,
      anticipationdef: 5, cover: 6, press: 4, teamwork: 4,
      // Reduce attacking flair
      dribbling: -3, flair: -4, finishing: -6
    },
    'CM': { 
      passing: 6, passinglong: 5, passingshort: 6, passingvision: 5,
      vision: 6, stamina: 6, workrate: 6, technique: 4, ballcontrol: 4,
      firsttouch: 4, decisions: 4, teamwork: 5, concentration: 3
    },
    'AM': { 
      passing: 4, passingvision: 6, vision: 8, creativity: 8, technique: 6,
      flair: 6, throughball: 7, ballcontrol: 5, firsttouch: 5,
      anticipation: 4, decisions: 4, composure: 3, dribbling: 4
    },
    'RW': { 
      pace: 7, acceleration: 7, dribbling: 6, dribblingclose: 6, dribblingopen: 5,
      crossing: 5, crossingearly: 4, crossinglate: 4, flair: 5, agility: 5,
      balance: 4, technique: 4, curve: 3, onevone: 5
    },
    'LW': { 
      pace: 7, acceleration: 7, dribbling: 6, dribblingclose: 6, dribblingopen: 5,
      crossing: 5, crossingearly: 4, crossinglate: 4, flair: 5, agility: 5,
      balance: 4, technique: 4, curve: 3, onevone: 5
    },
    'ST': { 
      finishing: 8, composure: 6, positioning: 6, movement: 7, heading: 5,
      shotpower: 5, shotaccuracy: 6, finishingangle: 5, composurebox: 6,
      instinct: 6, poaching: 6, tapin: 5, strength: 4, aerialduel: 4,
      anticipation: 5, offball: 6,
      // Reduce some non-striker attributes
      tackling: -5, marking: -6, interceptions: -4
    }
  };

  return bonuses[position] || {};
}

/**
 * Generate realistic traits based on position and attributes
 */
function generateTraits(position, attributes) {
  const traits = [];
  const traitChance = 0.3; // 30% chance per trait

  const positionTraits = {
    'GK': ['Shot Stopper', 'Sweeper Keeper', 'Command of Area', 'Punches Crosses'],
    'CB': ['Aerial Threat', 'Ball Playing Defender', 'Stopper', 'Leadership'],
    'RB': ['Attacking Full-back', 'Defensive Full-back', 'Engine', 'Technical'],
    'LB': ['Attacking Full-back', 'Defensive Full-back', 'Engine', 'Technical'],
    'DM': ['Ball Winner', 'Deep Lying Playmaker', 'Hard Worker', 'Leadership'],
    'CM': ['Box to Box', 'Playmaker', 'Hard Worker', 'Technical'],
    'AM': ['Creative', 'Technical', 'Flair', 'Set Piece Specialist'],
    'RW': ['Pacy', 'Technical', 'Direct', 'Cut Inside'],
    'LW': ['Pacy', 'Technical', 'Direct', 'Cut Inside'],
    'ST': ['Clinical Finisher', 'Target Man', 'Pace Merchant', 'Poacher']
  };

  const availableTraits = positionTraits[position] || [];
  
  for (const trait of availableTraits) {
    if (Math.random() < traitChance) {
      traits.push(trait);
    }
  }

  // Attribute-based traits
  if (attributes.pace > 85) traits.push('Pacy');
  if (attributes.strength > 85) traits.push('Strong');
  if (attributes.technique > 85) traits.push('Technical');
  if (attributes.leadership > 85) traits.push('Captain');

  return [...new Set(traits)]; // Remove duplicates
}

/**
 * Calculate player market value
 */
function calculatePlayerValue(attributes, age, tier) {
  const avgAttribute = Object.values(attributes).reduce((a, b) => a + b, 0) / Object.values(attributes).length;
  
  let baseValue = Math.pow(avgAttribute / 50, 2.5) * 1000000; // Exponential scaling
  
  // Age curve
  const agePeak = 27;
  const ageMultiplier = age <= agePeak ? 
    0.7 + (age - 17) * 0.03 : 
    1.0 - (age - agePeak) * 0.04;
  
  // Tier multiplier
  const tierMultipliers = { 1: 1.0, 2: 0.6, 3: 0.3 };
  
  const finalValue = baseValue * ageMultiplier * tierMultipliers[tier];
  
  return Math.max(50000, Math.round(finalValue / 50000) * 50000); // Round to nearest 50k
}

/**
 * Calculate player weekly wage
 */
function calculatePlayerWage(attributes, age, tier) {
  const value = calculatePlayerValue(attributes, age, tier);
  const weeklyWage = value * 0.001; // Rough 0.1% of value as weekly wage
  
  return Math.max(500, Math.round(weeklyWage / 250) * 250); // Round to nearest 250
}

/**
 * Legacy function for backward compatibility
 */
export function generateRandomTeams(numTeams = 20, playersPerTeam = 25) {
  console.warn('generateRandomTeams is deprecated. Use generateWorldFootballSystem() instead.');
  
  const worldSystem = generateWorldFootballSystem();
  return worldSystem.allTeams.slice(0, numTeams);
}
