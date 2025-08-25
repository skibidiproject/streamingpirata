export default function Loader()
{
    return (

    <div className="flex flex-col justify-center items-center text-5xl w-full h-[30rem] bg-black text-white p-8 border-b-1 border-b-[#212121]">
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          <div className="text-center">
            <div className="flex space-x-1 justify-center items-center mb-4">
              <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-white rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>

    )
}