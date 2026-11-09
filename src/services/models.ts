export const models = [
    { label: 'GPT-6 Luna', value: 'gpt-6-luna' },
    { label: 'GPT-6.1 Terra', value: 'gpt-6.1-terra' },
];

export const normalizeModel = (value: unknown): string => {
    if (value === 'gpt-6.1-terra' || value === 'gpt-4o' || value === 'gpt-4') {
        return 'gpt-6.1-terra';
    }
    return 'gpt-6-luna';
};
