import { useState } from 'react';
import { type NextPage } from "next"; import Image from 'next/image';
import { SignInButton, useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from '~/components/loading';
import { PageLayout } from '~/components/layout';
import { PostView } from '~/components/PostView';

const CreatePostWizard = () => {
  const ctx = api.useContext();
  const { user } = useUser();
  const [input, setInput] = useState('');

  const { mutate, isLoading: isPostion } = api.post.create.useMutation({
    onSuccess: () => {
      void ctx.post.getAll.invalidate();
      setInput('')
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post? Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <div className='flex gap-3 w-full'>
      <Image
        src={user.profileImageUrl}
        alt={user.fullName || 'user name'}
        className='w-14 h-14 rounded-full'
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder='Type some emojies!'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            mutate({ content: input });
          }
        }}
        disabled={isPostion}
        className='bg-transparent grow outline-none'
      />
      {input !== "" && !isPostion && <button onClick={() => mutate({ content: input })}>
        Post
      </button>
      }
      {isPostion && <div className='flex items-center justify-center'>
        <LoadingSpinner size={20} />
      </div>}
    </div>
  );
}

const Feed = () => {
  const { data, isLoading: postLoading } = api.post.getAll.useQuery();

  if (postLoading) return (<LoadingPage />);

  return (
    <div className='flex flex-col'>
      {!data
        ? <div>No posts</div>
        : data.map((fullPost) => (
          <PostView key={fullPost.post.id} {...fullPost} />
        ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // Start fetching asap
  api.post.getAll.useQuery();

  if (!userLoaded) return (<div />);

  return (
    <PageLayout>

      <div className='border-b border-slate-400 flex p-4'>
        {!isSignedIn ? (
          <div className='flex justify-center'><SignInButton /></div>) : (
          <CreatePostWizard />
          // <div className='flex justify-center'><SignOutButton /></div>
        )}
      </div>

      <Feed />
    </PageLayout>
  );
};

export default Home;
