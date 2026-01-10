import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const existingItems = await knex('music_items').count('id as count').first();
  
  if (existingItems && parseInt(existingItems.count as string) > 0) {
    console.log('Music items already seeded, skipping...');
    return;
  }

  await knex('music_items').insert([
    {
      type: 'album',
      title: 'ASTROWORLD',
      artist: 'Travis Scott',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_astroworld',
      apple_music_id: 'apple_astroworld'
    },
    {
      type: 'song',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_blinding_lights',
      apple_music_id: 'apple_blinding_lights'
    },
    {
      type: 'album',
      title: 'Blonde',
      artist: 'Frank Ocean',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_blonde',
      apple_music_id: 'apple_blonde'
    },
    {
      type: 'artist',
      title: 'Kendrick Lamar',
      artist: 'Artist Profile',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_kendrick',
      apple_music_id: 'apple_kendrick'
    },
    {
      type: 'album',
      title: 'folklore',
      artist: 'Taylor Swift',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_folklore',
      apple_music_id: 'apple_folklore'
    },
    {
      type: 'song',
      title: 'As It Was',
      artist: 'Harry Styles',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_as_it_was',
      apple_music_id: 'apple_as_it_was'
    },
    {
      type: 'album',
      title: 'To Pimp a Butterfly',
      artist: 'Kendrick Lamar',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_tpab',
      apple_music_id: 'apple_tpab'
    },
    {
      type: 'album',
      title: 'My Beautiful Dark Twisted Fantasy',
      artist: 'Kanye West',
      image_url: 'https://i.scdn.co/image/placeholder',
      spotify_id: 'spotify_mbdtf',
      apple_music_id: 'apple_mbdtf'
    }
  ]);

  console.log('Music items seeded successfully');
}
