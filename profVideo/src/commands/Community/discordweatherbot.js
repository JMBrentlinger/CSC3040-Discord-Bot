const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const weather = require('weather-js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Gets the weather of a given area')
        .addStringOption(option => option.setName('location') .setDescription('The location to check the weather of').setRequired(true))
        .addStringOption(option => option.setName('degree_type').setDescription('Select what degree type you would like').addChoices(
                    { name: 'Fahrenheit', value: 'F' },
                    { name: 'Celsius', value: 'C' }
                ).setRequired(true)),
    
    async execute(interaction) {
        const { options } = interaction
        const location = options.getString('location');
        const degreeType = options.getString('degree_type');

        await interaction.reply({
            content: '⏳ Gathering your weather data...',
            ephemeral: true
        });

        weather.find({ search: `${location}`, degreeType: `${degreeType}` }, async (err, result) => {
            if (err || result.length === 0) {
                console.error(err);
                return interaction.editReply({
                    content: `❌ Error: Could not find weather data for "${location}". Please try again.`,
                    ephemeral: true
                });
            }

            const weatherData = result[0];
            const current = weatherData.current;
            const locationData = weatherData.location;

            const embed = new EmbedBuilder()
                .setColor('#0000FF')
                .setTitle(`Current Weather in ${locationData.name}`)
                .addFields(
                    { name: 'Temperature', value: `${current.temperature}°${degreeType}`, inline: true },
                    { name: 'Feels Like', value: `${current.feelslike}°${degreeType}`, inline: true },
                    { name: 'Condition', value: current.skytext, inline: true },
                    { name: 'Alerts', value: locationData.alert || 'None', inline: true },
                    { name: 'Day', value: current.day, inline: true },
                    { name: 'Wind', value: current.winddisplay, inline: true }
                )
                .setThumbnail(current.imageUrl);

            await interaction.editReply({ content: '', embeds: [embed] });
        });
    }
};
