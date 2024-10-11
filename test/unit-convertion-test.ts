type SpoonacularIngredient = {
    amount: number,
    id: number,
    image: string,
    meta: [],
    name: string,
    unit: string
};

const IngredientUnitConverters = {
    // https://en.wikipedia.org/wiki/Ounce
    'ounces': {
        multiplier: 28.349523125, // The international yard and pound agreement
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    'oz': {
        multiplier: 28.349523125, // The international yard and pound agreement
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    // https://en.wikipedia.org/wiki/Pound_(mass)
    'pounds': {
        multiplier: 453, // SI
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    'lb': {
        multiplier: 453, // SI
        targetUnit: 'g',
        targetUnitBorder: 1000,
        superiorUnit: 'kg'
    },
    // https://en.wikipedia.org/wiki/Pint
    'pints': {
        multiplier: 568.261, // SI (imperial)
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    'pt': {
        multiplier: 568.261, // SI (imperial)
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    // https://en.wikipedia.org/wiki/Quart
    'quarts': {
        multiplier: 1.13652, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    'qt': {
        multiplier: 1.13652, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    // https://en.wikipedia.org/wiki/Gallon
    'gallons': {
        multiplier: 4.54609, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    'gal': {
        multiplier: 4.54609, // SI
        targetUnit: 'l',
        targetUnitBorder: 100,
        superiorUnit: 'hl'
    },
    // https://en.wikipedia.org/wiki/Fluid_ounce
    'fluid ounces':{
        multiplier: 28.41306, // SI
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    },
    'fl oz': {
        multiplier: 28.41306, // SI
        targetUnit: 'ml',
        targetUnitBorder: 1000,
        superiorUnit: 'l'
    }
};

const testIngredients: SpoonacularIngredient[] = [];
for (let i = 0; i < 20; i++) {
    let unit = 'pt';

    switch (Math.floor(Math.random() * 12) + 1) {
    case 1: unit = 'ounces'; break;
    case 2: unit = 'oz'; break;
    case 3: unit = 'pounds'; break;
    case 4: unit = 'lb'; break;
    case 5: unit = 'pints'; break;
    case 6: unit = 'pt'; break;
    case 7: unit = 'quarts'; break;
    case 8: unit = 'qt'; break;
    case 9: unit = 'gallons'; break;
    case 10: unit = 'gal'; break;
    case 11: unit = 'fluid ounces'; break;
    case 12: unit = 'fl oz'; break;
    }
    const ingredient: SpoonacularIngredient = {
        name: 'x',
        image: 'x',
        id: 1,
        meta: [],
        amount: Math.floor(Math.random() * 10) + 1, // 1-10
        unit
    };

    testIngredients.push(ingredient);
}

// TEST
testIngredients.forEach(ingredient => {
    const { amount, unit } = proceedIngredientUnit(ingredient);
    // eslint-disable-next-line no-console
    console.log(amount, unit);
});

function toFixNumber(number: number, fractionDigits: number = 2): number {
    const fixed = number.toFixed(fractionDigits);

    return Number(fixed);
}

function discardDecimalPoint(number: number): number {
    return Number(number.toString().split('.')[0]);
}

function proceedIngredientUnit(ingredient: SpoonacularIngredient): SpoonacularIngredient {
    const { multiplier, targetUnit, targetUnitBorder, superiorUnit } = IngredientUnitConverters[ingredient.unit];

    const convertedAmount = ingredient.amount * multiplier;
    const unit = convertedAmount > targetUnitBorder ? superiorUnit : targetUnit;
    const amount = convertedAmount > targetUnitBorder ? convertedAmount / targetUnitBorder : convertedAmount;

    return {
        ...ingredient,
        name: ingredient.name,
        image: ingredient.image,
        amount: ['g', 'ml'].includes(unit) ? discardDecimalPoint(amount) : toFixNumber(amount, 1),
        unit
    };
}