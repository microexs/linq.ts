import test from 'ava';

import List from './list';

interface IPackage {
  Company: string;
  Weight: number;
  TrackingNumber: number;
}

interface IPerson {
  name: string;
  age?: number;
}

interface IPet {
  name: string;
  age?: number;
  owner?: Person;
  vaccinated?: boolean;
}

interface IProduct {
  name: string;
  code: number;
}

class Package {
  public company: string;
  public weight: number;
  public trackingNumber: number;

  constructor(p: IPackage) {
    this.company = p.Company;
    this.weight = p.Weight;
    this.trackingNumber = p.TrackingNumber;
  }
}

class Person implements IPerson {
  public name: string;
  public age: number;

  constructor(pet: IPet) {
    this.name = pet.name;
    this.age = pet.age;
  }
}

class Pet implements IPet {
  public name: string;
  public age: number;
  public owner: Person;
  public vaccinated: boolean;

  constructor(pet: IPet) {
    this.name = pet.name;
    this.age = pet.age;
    this.owner = pet.owner;
    this.vaccinated = pet.vaccinated;
  }
}

class Dog extends Pet {
  public speak(): string {
    return 'Bark';
  }
}

class PetOwner {
  constructor(public name: string, public pets: List<Pet>) {}
}

class Product implements IProduct {
  public name: string;
  public code: number;

  constructor(product: IProduct) {
    this.name = product.name;
    this.code = product.code;
  }
}

test('Add', t => {
  const list = new List<string>();
  list.add('hey');
  t.is(list.first(), 'hey');
});

test('AddRange', t => {
  const list = new List<string>();
  list.addRange(['hey', 'what\'s', 'up']);
  t.deepEqual(list.toArray(), ['hey', 'what\'s', 'up']);
});

test('Aggregate', t => {
  const sentence = 'the quick brown fox jumps over the lazy dog';
  const reversed = 'dog lazy the over jumps fox brown quick the ';
  const words = new List<string>(sentence.split(' '));
  t.is(
    words.aggregate(
      (workingSentence, next) => next + ' ' + workingSentence,
      ''
    ),
    reversed
  );
});

test('All', t => {
  const pets = new List<Pet>([
    new Pet({ age: 10, name: 'Barley' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 6, name: 'Whiskers' })
  ]);

  // determine whether all pet names
  // in the array start with 'B'.
  t.false(pets.all(pet => pet.name.startsWith('B')));
});

test('Any', t => {
  const pets = new List<Pet>([
    new Pet({ age: 8, name: 'Barley', vaccinated: true }),
    new Pet({ age: 4, name: 'Boots', vaccinated: false }),
    new Pet({ age: 1, name: 'Whiskers', vaccinated: false })
  ]);

  // determine whether any pets over age 1 are also unvaccinated.
  t.true(pets.any(p => p.age > 1 && p.vaccinated === false));
  t.true(pets.any());
});

test('Average', t => {
  const grades = new List<number>([78, 92, 100, 37, 81]);
  const people = new List<IPerson>([
    { age: 15, name: 'Cathy' },
    { age: 25, name: 'Alice' },
    { age: 50, name: 'Bob' }
  ]);
  t.is(grades.average(), 77.6);
  t.is(people.average(x => x.age), 30);
});

test('Cast', t => {
  const pets = new List<Pet>([
    new Dog({ age: 8, name: 'Barley', vaccinated: true }),
    new Pet({ age: 1, name: 'Whiskers', vaccinated: false })
  ]);

  const dogs = pets.cast<Dog>();

  t.true(typeof dogs.first().speak === 'function');
  t.is(dogs.first().speak(), 'Bark');
  t.true(dogs.last().speak === undefined);
});

test('Concat', t => {
  const cats = new List<Pet>([
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 1, name: 'Whiskers' })
  ]);
  const dogs = new List<Pet>([
    new Pet({ age: 3, name: 'Bounder' }),
    new Pet({ age: 14, name: 'Snoopy' }),
    new Pet({ age: 9, name: 'Fido' })
  ]);
  const expected = ['Barley', 'Boots', 'Whiskers', 'Bounder', 'Snoopy', 'Fido'];
  t.deepEqual(
    cats
      .select(cat => cat.name)
      .concat(dogs.select(dog => dog.name))
      .toArray(),
    expected
  );
});

test('Contains', t => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ]);
  t.true(fruits.contains('mango'));
});

test('Count', t => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ]);
  t.is(fruits.count(), 6);
  t.is(fruits.count(x => x.length > 5), 3);
});

test('DefaultIfEmpty', t => {
  const pets = new List<Pet>([
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 1, name: 'Whiskers' })
  ]);
  t.deepEqual(
    pets
      .defaultIfEmpty()
      .select(pet => pet.name)
      .toArray(),
    ['Barley', 'Boots', 'Whiskers']
  );
  const numbers = new List<number>();
  t.deepEqual(numbers.defaultIfEmpty(0).toArray(), [0]);
});

test('Distinct', t => {
  const ages = new List<number>([21, 46, 46, 55, 17, 21, 55, 55]);
  const pets = new List<Pet>([
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 9, name: 'Corey' })
  ]);
  const expected = new List<Pet>([
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 9, name: 'Corey' })
  ]);
  t.deepEqual(ages.distinct(), new List<number>([21, 46, 55, 17]));
  t.deepEqual(pets.distinct(), expected);
});

test('DistinctBy', t => {
  const pets = new List<Pet>([
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 4, name: 'Daisy' })
  ]);

  const result = new List<Pet>([
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 8, name: 'Barley' })
  ]);

  t.deepEqual(pets.distinctBy(pet => pet.age), result);
});

test('ElementAt', t => {
  const a = new List<string>(['hey', 'hola', 'que', 'tal']);
  t.is(a.elementAt(0), 'hey');
  t.throws(
    () => a.elementAt(4),
    /ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source./
  );
});

test('ElementAtOrDefault', t => {
  const a = new List<string>(['hey', 'hola', 'que', 'tal']);
  t.is(a.elementAtOrDefault(0), 'hey');
  t.throws(
    () => a.elementAtOrDefault(4),
    /ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source./
  );
});

test('Except', t => {
  const numbers1 = new List<number>([2, 2.1, 2.2, 2.3, 2.4, 2.5]);
  const numbers2 = new List<number>([2.2, 2.3]);
  t.deepEqual(numbers1.except(numbers2).toArray(), [2, 2.1, 2.4, 2.5]);
});

test('First', t => {
  t.is(new List<string>(['hey', 'hola', 'que', 'tal']).first(), 'hey');
  t.is(new List<number>([1, 2, 3, 4, 5]).first(x => x > 2), 3);
  t.throws(
    () => new List<string>().first(),
    /InvalidOperationException: The source sequence is empty./
  );
});

test('FirstOrDefault', t => {
  t.is(new List<string>(['hey', 'hola', 'que', 'tal']).firstOrDefault(), 'hey');
  t.is(new List<string>().firstOrDefault(), undefined);
});

test('ForEach', t => {
  const names = new List<string>(['Bruce', 'Alfred', 'Tim', 'Richard']);
  let test = '';
  names.forEach((x, i) => (test += `${x} ${i} `));
  t.is(test, 'Bruce 0 Alfred 1 Tim 2 Richard 3 ');
});

test('GroupBy', t => {
  const pets = new List<Pet>([
    new Pet({ age: 8, name: 'Barley' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 1, name: 'Whiskers' }),
    new Pet({ age: 4, name: 'Daisy' })
  ]);
  const result = {
    1: ['Whiskers'],
    4: ['Boots', 'Daisy'],
    8: ['Barley']
  };
  t.deepEqual(pets.groupBy(pet => pet.age, pet => pet.name), result);
});

test('GroupJoin', t => {
  const magnus = new Person({ name: 'Hedlund, Magnus' });
  const terry = new Person({ name: 'Adams, Terry' });
  const charlotte = new Person({ name: 'Weiss, Charlotte' });

  const barley = new Pet({ name: 'Barley', owner: terry });
  const boots = new Pet({ name: 'Boots', owner: terry });
  const whiskers = new Pet({ name: 'Whiskers', owner: charlotte });
  const daisy = new Pet({ name: 'Daisy', owner: magnus });

  const people = new List<Person>([magnus, terry, charlotte]);
  const pets = new List<Pet>([barley, boots, whiskers, daisy]);

  // create a list where each element is an anonymous
  // type that contains a person's name and
  // a collection of names of the pets they own.
  const query = people.groupJoin(
    pets,
    person => person,
    pet => pet.owner,
    (person, petCollection) => ({
      ownerName: person.name,
      pets: petCollection.select(pet => pet.name)
    })
  );
  const expected = [
    'Hedlund, Magnus: Daisy',
    'Adams, Terry: Barley,Boots',
    'Weiss, Charlotte: Whiskers'
  ];
  t.deepEqual(
    query.select(obj => `${obj.ownerName}: ${obj.pets.toArray()}`).toArray(),
    expected
  );
});

test('IndexOf', t => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ]);

  const barley = new Pet({ age: 8, name: 'Barley', vaccinated: true });
  const boots = new Pet({ age: 4, name: 'Boots', vaccinated: false });
  const whiskers = new Pet({ age: 1, name: 'Whiskers', vaccinated: false });
  const pets = new List<Pet>([barley, boots, whiskers]);

  t.is(fruits.indexOf('orange'), 3);
  t.is(fruits.indexOf('strawberry'), -1);
  t.is(pets.indexOf(boots), 1);
});

test('Insert', t => {
  const pets = new List<Pet>([
    new Pet({ age: 10, name: 'Barley' }),
    new Pet({ age: 4, name: 'Boots' }),
    new Pet({ age: 6, name: 'Whiskers' })
  ]);

  const newPet = new Pet({ age: 12, name: 'Max' });

  pets.insert(0, newPet);
  pets.insert(pets.count(), newPet);

  t.is(pets.first(), newPet);
  t.is(pets.last(), newPet);
  t.throws(() => pets.insert(-1, newPet), /Index is out of range./);
  t.throws(
    () => pets.insert(pets.count() + 1, newPet),
    /Index is out of range./
  );
});

test('Intersect', t => {
  const id1 = new List<number>([44, 26, 92, 30, 71, 38]);
  const id2 = new List<number>([39, 59, 83, 47, 26, 4, 30]);
  t.is(id1.intersect(id2).sum(x => x), 56);
});

test('Join', t => {
  const magnus = new Person({ name: 'Hedlund, Magnus' });
  const terry = new Person({ name: 'Adams, Terry' });
  const charlotte = new Person({ name: 'Weiss, Charlotte' });

  const barley = new Pet({ name: 'Barley', owner: terry });
  const boots = new Pet({ name: 'Boots', owner: terry });
  const whiskers = new Pet({ name: 'Whiskers', owner: charlotte });
  const daisy = new Pet({ name: 'Daisy', owner: magnus });

  const people = new List<Person>([magnus, terry, charlotte]);
  const pets = new List<Pet>([barley, boots, whiskers, daisy]);

  // create a list of Person-Pet pairs where
  // each element is an anonymous type that contains a
  // pet's name and the name of the Person that owns the Pet.
  const query = people.join(
    pets,
    person => person,
    pet => pet.owner,
    (person, pet) => ({ ownerName: person.name, Pet: pet.name })
  );
  const expected = [
    'Hedlund, Magnus - Daisy',
    'Adams, Terry - Barley',
    'Adams, Terry - Boots',
    'Weiss, Charlotte - Whiskers'
  ];
  t.deepEqual(
    query.select(obj => `${obj.ownerName} - ${obj.Pet}`).toArray(),
    expected
  );
});

test('Last', t => {
  t.is(new List<string>(['hey', 'hola', 'que', 'tal']).last(), 'tal');
  t.is(new List<number>([1, 2, 3, 4, 5]).last(x => x > 2), 5);
  t.throws(
    () => new List<string>().last(),
    /InvalidOperationException: The source sequence is empty./
  );
});

test('LastOrDefault', t => {
  t.is(new List<string>(['hey', 'hola', 'que', 'tal']).lastOrDefault(), 'tal');
  t.is(new List<string>().lastOrDefault(), undefined);
});

test('Max', t => {
  const people = new List<IPerson>([
    { age: 15, name: 'Cathy' },
    { age: 25, name: 'Alice' },
    { age: 50, name: 'Bob' }
  ]);
  t.is(people.max(x => x.age), 50);
  t.is(new List<number>([1, 2, 3, 4, 5]).max(), 5);
});

test('Min', t => {
  const people = new List<IPerson>([
    { age: 15, name: 'Cathy' },
    { age: 25, name: 'Alice' },
    { age: 50, name: 'Bob' }
  ]);
  t.is(people.min(x => x.age), 15);
  t.is(new List<number>([1, 2, 3, 4, 5]).min(), 1);
});

test('OfType', t => {
  const pets = new List<Pet>([
    new Dog({ age: 8, name: 'Barley', vaccinated: true }),
    new Pet({ age: 1, name: 'Whiskers', vaccinated: false })
  ]);
  const anyArray = new List<any>(['dogs', 'cats', 13, true]);

  t.is(anyArray.ofType(String).count(), 2);
  t.is(anyArray.ofType(Number).count(), 1);
  t.is(anyArray.ofType(Boolean).count(), 1);
  t.is(anyArray.ofType(Function).count(), 0);

  t.is(pets.ofType(Dog).count(), 1);
  t.is(
    pets
      .ofType<Dog>(Dog)
      .first()
      .speak(),
    'Bark'
  );
});

test('OrderBy', t => {
  const expected = [1, 2, 3, 4, 5, 6];
  t.deepEqual(
    new List<number>([4, 5, 6, 3, 2, 1]).orderBy(x => x).toArray(),
    expected
  );
  t.deepEqual(
    new List<string>(['Deutschland', 'Griechenland', 'Ägypten'])
      .orderBy(x => x, (a, b) => a.localeCompare(b))
      .toArray(),
    ['Ägypten', 'Deutschland', 'Griechenland']
  );
});

test('OrderByDescending', t => {
  t.deepEqual(
    new List<number>([4, 5, 6, 3, 2, 1]).orderByDescending(x => x).toArray(),
    [6, 5, 4, 3, 2, 1]
  );
});

test('ThenBy', t => {
  const fruits = new List<string>([
    'grape',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'raspberry',
    'apple',
    'blueberry'
  ]);
  // sort the strings first by their length and then
  // alphabetically by passing the identity selector function.
  const expected = [
    'apple',
    'grape',
    'mango',
    'banana',
    'orange',
    'blueberry',
    'raspberry',
    'passionfruit'
  ];
  t.deepEqual(
    fruits
      .orderBy(fruit => fruit.length)
      .thenBy(fruit => fruit)
      .toArray(),
    expected
  );
  const expectedNums = [1, 2, 3, 4, 5, 6];
  // test omission of OrderBy
  t.deepEqual(
    new List<number>([4, 5, 6, 3, 2, 1]).thenBy(x => x).toArray(),
    expectedNums
  );
});

// see https://github.com/kutyel/linq.ts/issues/23
test('ThenByMultiple', t => {
  const x = { a: 2, b: 1, c: 1 };
  const y = { a: 1, b: 2, c: 2 };
  const z = { a: 1, b: 1, c: 3 };
  const unsorted = new List([x, y, z]);
  const sorted = unsorted
    .orderBy(u => u.a)
    .thenBy(u => u.b)
    .thenBy(u => u.c)
    .toArray();

  t.is(sorted[0], z);
  t.is(sorted[1], y);
  t.is(sorted[2], x);
});

test('ThenByDescending', t => {
  const fruits = new List<string>([
    'grape',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'raspberry',
    'apple',
    'blueberry'
  ]);

  // sort the strings first by their length and then
  // alphabetically descending by passing the identity selector function.
  const expected = [
    'mango',
    'grape',
    'apple',
    'orange',
    'banana',
    'raspberry',
    'blueberry',
    'passionfruit'
  ];
  t.deepEqual(
    fruits
      .orderBy(fruit => fruit.length)
      .thenByDescending(fruit => fruit)
      .toArray(),
    expected
  );
  t.deepEqual(
    new List<number>([4, 5, 6, 3, 2, 1]).thenByDescending(x => x).toArray(),
    [6, 5, 4, 3, 2, 1]
  );
});

test('Remove', t => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ]);

  const barley = new Pet({ age: 8, name: 'Barley', vaccinated: true });
  const boots = new Pet({ age: 4, name: 'Boots', vaccinated: false });
  const whiskers = new Pet({ age: 1, name: 'Whiskers', vaccinated: false });
  const pets = new List<Pet>([barley, boots, whiskers]);
  const lesspets = new List<Pet>([barley, whiskers]);

  t.true(fruits.remove('orange'));
  t.false(fruits.remove('strawberry'));
  t.true(pets.remove(boots));
  t.deepEqual(pets, lesspets);
});

test('RemoveAll', t => {
  const dinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ]);
  const lessDinosaurs = new List<string>([
    'Compsognathus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Gallimimus',
    'Triceratops'
  ]);
  t.deepEqual(dinosaurs.removeAll(x => x.endsWith('saurus')), lessDinosaurs);
});

test('RemoveAt', t => {
  const dinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ]);
  const lessDinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ]);
  dinosaurs.removeAt(3);
  t.deepEqual(dinosaurs, lessDinosaurs);
});

test('Reverse', t => {
  t.deepEqual(new List<number>([1, 2, 3, 4, 5]).reverse().toArray(), [
    5,
    4,
    3,
    2,
    1
  ]);
});

test('Select', t => {
  t.deepEqual(new List<number>([1, 2, 3]).select(x => x * 2).toArray(), [
    2,
    4,
    6
  ]);
});

test('SelectMany', t => {
  const petOwners = new List<PetOwner>([
    new PetOwner(
      'Higa, Sidney',
      new List<Pet>([new Pet({ name: 'Scruffy' }), new Pet({ name: 'Sam' })])
    ),
    new PetOwner(
      'Ashkenazi, Ronen',
      new List<Pet>([new Pet({ name: 'Walker' }), new Pet({ name: 'Sugar' })])
    ),
    new PetOwner(
      'Price, Vernette',
      new List<Pet>([
        new Pet({ name: 'Scratches' }),
        new Pet({ name: 'Diesel' })
      ])
    )
  ]);
  const expected = ['Scruffy', 'Sam', 'Walker', 'Sugar', 'Scratches', 'Diesel'];
  t.deepEqual(
    petOwners
      .selectMany(petOwner => petOwner.pets)
      .select(pet => pet.name)
      .toArray(),
    expected
  );
});

test('SequenceEqual', t => {
  const pet1 = new Pet({ age: 2, name: 'Turbo' });
  const pet2 = new Pet({ age: 8, name: 'Peanut' });

  // create three lists of pets.
  const pets1 = new List<Pet>([pet1, pet2]);
  const pets2 = new List<Pet>([pet1, pet2]);
  const pets3 = new List<Pet>([pet1]);

  t.true(pets1.sequenceEqual(pets2));
  t.false(pets1.sequenceEqual(pets3));
});

test('Single', t => {
  const fruits1 = new List<string>();
  const fruits2 = new List<string>(['orange']);
  const fruits3 = new List<string>(['orange', 'apple']);
  const numbers1 = new List([1, 2, 3, 4, 5, 5]);
  t.is(fruits2.single(), 'orange');
  t.throws(
    () => fruits1.single(),
    /The collection does not contain exactly one element./
  );
  t.throws(
    () => fruits3.single(),
    /The collection does not contain exactly one element./
  );
  t.is(numbers1.single(x => x === 1), 1);
  t.throws(
    () => numbers1.single(x => x === 5),
    /The collection does not contain exactly one element./
  );
  t.throws(
    () => numbers1.single(x => x > 5),
    /The collection does not contain exactly one element./
  );
});

test('SingleOrDefault', t => {
  const fruits1 = new List<string>();
  const fruits2 = new List<string>(['orange']);
  const fruits3 = new List<string>(['orange', 'apple']);
  const numbers1 = new List([1, 2, 3, 4, 5, 5]);
  t.is(fruits1.singleOrDefault(), undefined);
  t.is(fruits2.singleOrDefault(), 'orange');
  t.throws(
    () => fruits3.singleOrDefault(),
    /The collection does not contain exactly one element./
  );
  t.is(numbers1.singleOrDefault(x => x === 1), 1);
  t.is(numbers1.singleOrDefault(x => x > 5), undefined);
  t.throws(
    () => numbers1.singleOrDefault(x => x === 5),
    /The collection does not contain exactly one element./
  );
});

test('Skip', t => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85]);
  t.deepEqual(
    grades
      .orderByDescending(x => x)
      .skip(3)
      .toArray(),
    [82, 70, 59, 56]
  );
});

test('SkipWhile', t => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85]);
  t.deepEqual(
    grades
      .orderByDescending(x => x)
      .skipWhile(grade => grade >= 80)
      .toArray(),
    [70, 59, 56]
  );
});

test('Sum', t => {
  const people = new List<IPerson>([
    { age: 15, name: 'Cathy' },
    { age: 25, name: 'Alice' },
    { age: 50, name: 'Bob' }
  ]);
  t.is(new List<number>([2, 3, 5]).sum(), 10);
  t.is(people.sum(x => x.age), 90);
});

test('Take', t => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85]);
  t.deepEqual(
    grades
      .orderByDescending(x => x)
      .take(3)
      .toArray(),
    [98, 92, 85]
  );
});

test('TakeWhile', t => {
  const expected = ['apple', 'banana', 'mango'];
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ]);
  t.deepEqual(fruits.takeWhile(fruit => fruit !== 'orange').toArray(), expected);
});

test('toArray', t => {
  t.deepEqual(new List<number>([1, 2, 3, 4, 5]).toArray(), [1, 2, 3, 4, 5]);
});

test('ToDictionary', t => {
  const people = new List<IPerson>([
    { age: 15, name: 'Cathy' },
    { age: 25, name: 'Alice' },
    { age: 50, name: 'Bob' }
  ]);
  const dictionary = people.toDictionary(x => x.name);
  t.deepEqual(dictionary['Bob'], { age: 50, name: 'Bob' });
  t.is(dictionary['Bob'].age, 50);
  const dictionary2 = people.toDictionary(x => x.name, y => y.age);
  t.is(dictionary2['Alice'], 25);
  // Dictionary should behave just like in C#
  t.is(dictionary.max(x => x.Value.age), 50);
  t.is(dictionary.min(x => x.Value.age), 15);
  const expectedKeys = new List(['Cathy', 'Alice', 'Bob']);
  t.deepEqual(dictionary.select(x => x.Key), expectedKeys);
  t.deepEqual(dictionary.select(x => x.Value), people);
});

test('ToList', t => {
  t.deepEqual(new List<number>([1, 2, 3]).toList().toArray(), [1, 2, 3]);
});

test('ToLookup', t => {
  // create a list of Packages
  const packages = new List<Package>([
    new Package({
      Company: 'Coho Vineyard',
      TrackingNumber: 89453312,
      Weight: 25.2
    }),
    new Package({
      Company: 'Lucerne Publishing',
      TrackingNumber: 89112755,
      Weight: 18.7
    }),
    new Package({
      Company: 'Wingtip Toys',
      TrackingNumber: 299456122,
      Weight: 6
    }),
    new Package({
      Company: 'Contoso Pharmaceuticals',
      TrackingNumber: 670053128,
      Weight: 9.3
    }),
    new Package({
      Company: 'Wide World Importers',
      TrackingNumber: 4665518773,
      Weight: 33.8
    })
  ]);

  // create a Lookup to organize the packages.
  // use the first character of Company as the key value.
  // select Company appended to TrackingNumber
  // as the element values of the Lookup.
  const lookup = packages.toLookup(
    p => p.company.substring(0, 1),
    p => p.company + ' ' + p.trackingNumber
  );
  const result = {
    C: ['Coho Vineyard 89453312', 'Contoso Pharmaceuticals 670053128'],
    L: ['Lucerne Publishing 89112755'],
    W: ['Wingtip Toys 299456122', 'Wide World Importers 4665518773']
  };
  t.deepEqual(lookup, result);
});

test('Union', t => {
  const ints1 = new List<number>([5, 3, 9, 7, 5, 9, 3, 7]);
  const ints2 = new List<number>([8, 3, 6, 4, 4, 9, 1, 0]);
  t.deepEqual(ints1.union(ints2).toArray(), [5, 3, 9, 7, 8, 6, 4, 1, 0]);

  const result = [
    { Name: 'apple', Code: 9 },
    { Name: 'orange', Code: 4 },
    { Name: 'lemon', Code: 12 }
  ];
  const store1 = new List<Product>([
    new Product({ name: 'apple', code: 9 }),
    new Product({ name: 'orange', code: 4 })
  ]);
  const store2 = new List<Product>([
    new Product({ name: 'apple', code: 9 }),
    new Product({ name: 'lemon', code: 12 })
  ]);
  // t.deepEqual(store1.Union(store2).toArray(), result);
});

test('Where', t => {
  const fruits = new List<string>([
    'apple',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'blueberry',
    'grape',
    'strawberry'
  ]);
  const expected = ['apple', 'mango', 'grape'];
  t.deepEqual(fruits.where(fruit => fruit.length < 6).toArray(), expected);
});

test('Zip', t => {
  const numbers = new List<number>([1, 2, 3, 4]);
  const words = new List<string>(['one', 'two', 'three']);
  t.deepEqual(
    numbers.zip(words, (first, second) => `${first} ${second}`).toArray(),
    ['1 one', '2 two', '3 three']
  );
  // larger second array
  const expected = ['one 1', 'two 2', 'three 3'];
  const numbers2 = new List<number>([1, 2, 3, 4]);
  const words2 = new List<string>(['one', 'two', 'three']);
  t.deepEqual(
    words2.zip(numbers2, (first, second) => `${first} ${second}`).toArray(),
    expected
  );
});

test('Where().Select()', t => {
  t.deepEqual(
    new List<number>([1, 2, 3, 4, 5])
      .where(x => x > 3)
      .select(y => y * 2)
      .toArray(),
    [8, 10]
  );
  t.deepEqual(
    new List<number>([1, 2, 3, 4, 5])
      .where(x => x > 3)
      .select(y => y + 'a')
      .toArray(),
    ['4a', '5a']
  );
});
