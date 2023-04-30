import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from 'next/image';
import { createServerSideHelpers } from "@trpc/react-query/server"
import SuperJSON from 'superjson';

import { api } from '~/utils/api';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { PageLayout } from '~/components/layout';
import { LoadingPage } from '~/components/loading';
import { PostView } from '~/components/PostView';

const ProfilePeed = (props: { userId: string }) => {
    const { data, isLoading } = api.post.getPostByUserId.useQuery({ userId: props.userId });

    if (isLoading) return <LoadingPage />

    if (!data || data.length === 0) return <div>User has not posted</div>

    return (
        <div className='flex flex-col'>
            {data.map((fullPost) => (<PostView key={fullPost.post.id} {...fullPost} />))}
        </div>
    )

}

const ProfliePage: NextPage<{ username: string }> = ({ username }) => {
    const { data } = api.profile.getUserByUsername.useQuery({ username });

    if (!data) return (<div>User not found</div>)

    return (
        <>
            <Head>
                <title>{data.username} Profile</title>
            </Head>
            <PageLayout>
                <div className='h-36 bg-slate-600 relative'>
                    <Image
                        src={data.profileImageUrl}
                        alt={`${data.username ?? ""}'s profile picture`}
                        width={128}
                        height={128}
                        className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black bg-black"
                    />
                </div>
                <div className='h-[64px]'></div>
                <div className='p-4 text-2xl font-bold'>{`@${data.username ?? ""}`}</div>
                <div className='border-b border-slate-400' />
                <ProfilePeed userId={data.id} />
            </PageLayout>
        </>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    const ssg = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: SuperJSON,
    });

    const slug = context.params?.slug;
    if (typeof slug !== 'string') throw new Error('slug not found');

    const username = slug.replace('@', '');
    await ssg.profile.getUserByUsername.prefetch({ username });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            username
        }
    }
}

export const getStaticPaths = () => {
    return { paths: [], fallback: 'blocking' }
}

export default ProfliePage;
