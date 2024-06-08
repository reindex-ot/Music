import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import type { Album } from "@/db/schema";
import { useArtistForCurrentPage } from "@/api/artists/[id]";
import { useGetColumn } from "@/hooks/layout";

import { MediaCard } from "@/components/media/MediaCard";
import { MediaPageHeader } from "@/components/media/MediaPageHeader";
import { ScrollRow } from "@/components/ui/Container";
import { Description, Heading } from "@/components/ui/Text";
import { TrackList } from "@/features/track/components/TrackList";

/** @description Screen for `/artist/[id]` route. */
export default function CurrentArtistScreen() {
  const { id: _artistName } = useLocalSearchParams<{ id: string }>();
  const artistName = _artistName!;
  const { isPending, error, data } = useArtistForCurrentPage(artistName);

  if (isPending) return <View className="w-full flex-1 px-4" />;
  else if (error) {
    return (
      <View className="w-full flex-1 px-4">
        <Description className="text-accent50">
          Error: Artist not found
        </Description>
      </View>
    );
  }

  // Information about this track list.
  const trackSource = {
    type: "artist",
    name: `Artist\n${data.name}`,
    id: artistName,
  } as const;

  return (
    <>
      <View className="px-4">
        <MediaPageHeader
          title={data.name}
          metadata={data.metadata}
          trackSource={trackSource}
        />
      </View>
      <TrackList
        data={data.tracks}
        config={{ source: trackSource, origin: "artist" }}
        ListHeaderComponent={<ArtistAlbums albums={data.albums} />}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </>
  );
}

/**
 * @description Display a list of the artist's albums. Renders a heading
 *  for the track list only if the artist has albums.
 */
function ArtistAlbums({ albums }: { albums: Album[] | null }) {
  const { width } = useGetColumn({
    ...{ cols: 1, gap: 0, gutters: 32, minWidth: 100 },
  });

  if (!albums) return null;

  return (
    <>
      <Heading as="h3" className="mb-2 text-start font-geistMono">
        Albums
      </Heading>
      <View className="-mx-5 mb-4">
        <ScrollRow contentContainerClassName="gap-4 px-5">
          {albums.map((album) => (
            <MediaCard
              key={album.id}
              type="album"
              size={width}
              source={album.artwork}
              href={`/album/${album.id}`}
              title={album.name}
              subtitle={`${album.releaseYear ?? "————"}`}
            />
          ))}
        </ScrollRow>
      </View>
      <Heading as="h3" className="mb-2 text-start font-geistMono">
        Tracks
      </Heading>
    </>
  );
}
