import Image from 'next/image';
import Link from 'next/link';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number]

export const PostView = ({ author, post }: PostWithUser) => {
    return (
        <div key={post.id} className='p-4 border-b border-slate-400 flex gap-3'>
            <Image
                src={author.profileImageUrl}
                alt={`${author.username}'s profile picture`}
                className='w-14 h-14 rounded-full'
                width={56}
                height={56}
            />
            <div className='flex flex-col'>
                <div className='flex text-slate-300 gap-1'>
                    <Link href={`/@${author.username}`}>
                        <span>{`@${author.username}`}</span>
                    </Link>
                    <Link href={`/post/${post.id}`}>
                        <span className='font-thin'>
                            {`${String.fromCharCode(183)} ${dayjs(post.createdAt).fromNow()}`}
                        </span>
                    </Link>
                </div>
                <span className='text-2xl'>{post.content}</span>
            </div>
        </div>
    )
}