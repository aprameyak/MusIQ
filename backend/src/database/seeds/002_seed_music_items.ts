import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Check if music items already exist
  const existingItems = await knex('music_items').count('id as count').first();
  
  if (existingItems && parseInt(existingItems.count as string) > 0) {
    console.log('Music items already seeded, skipping...');
    return;
  }

  // Insert sample music items
  await knex('music_items').insert([
    {
      type: 'album',
      title: 'ASTROWORLD',
      artist: 'Travis Scott',
      image_url: 'https://images.unsplash.com/photo-1738667289162-9e55132e18a2?w=400&h=400&fit=crop',
      spotify_id: 'spotify_astroworld',
      apple_music_id: 'apple_astroworld'
    },
    {
      type: 'song',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      image_url: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400&h=400&fit=crop',
      spotify_id: 'spotify_blinding_lights',
      apple_music_id: 'apple_blinding_lights'
    },
    {
      type: 'album',
      title: 'Blonde',
      artist: 'Frank Ocean',
      image_url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=400&fit=crop',
      spotify_id: 'spotify_blonde',
      apple_music_id: 'apple_blonde'
    },
    {
      type: 'artist',
      title: 'Kendrick Lamar',
      artist: 'Artist Profile',
      image_url: 'https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?w=400&h=400&fit=crop',
      spotify_id: 'spotify_kendrick',
      apple_music_id: 'apple_kendrick'
    },
    {
      type: 'album',
      title: 'folklore',
      artist: 'Taylor Swift',
      image_url: 'https://images.unsplash.com/photo-1649956736509-f359d191bbcb?w=400&h=400&fit=crop',
      spotify_id: 'spotify_folklore',
      apple_music_id: 'apple_folklore'
    },
    {
      type: 'song',
      title: 'As It Was',
      artist: 'Harry Styles',
      image_url: 'https://images.unsplash.com/photo-1544616326-a041e9e3b348?w=400&h=400&fit=crop',
      spotify_id: 'spotify_as_it_was',
      apple_music_id: 'apple_as_it_was'
    },
    {
      type: 'album',
      title: 'To Pimp a Butterfly',
      artist: 'Kendrick Lamar',
      image_url: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400&h=400&fit=crop',
      spotify_id: 'spotify_tpab',
      apple_music_id: 'apple_tpab'
    },
    {
      type: 'album',
      title: 'My Beautiful Dark Twisted Fantasy',
      artist: 'Kanye West',
      image_url: 'https://images.unsplash.com/photo-1738667289162-9e55132e18a2?w=400&h=400&fit=crop',
      spotify_id: 'spotify_mbdtf',
      apple_music_id: 'apple_mbdtf'
    }
  ]);

  console.log('Music items seeded successfully');
}

