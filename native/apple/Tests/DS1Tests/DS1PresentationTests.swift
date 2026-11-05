import XCTest
@testable import DS1

@MainActor final class DS1PresentationTests: XCTestCase {
    private func queued(_ count: Int) async {
        for _ in 0..<100 where DS1Overlays.shared.queue.count != count { await Task.yield() }
        XCTAssertEqual(DS1Overlays.shared.queue.count, count)
    }
    func testCancelledCallerRemovesItsReviewAndResumesFalse() async {
        DS1Overlays.cancelAll()
        let task=Task { await DS1Overlays.confirm("A cancelled review") }
        await queued(1);task.cancel();let answer=await task.value
        XCTAssertFalse(answer);XCTAssertTrue(DS1Overlays.shared.queue.isEmpty)
    }
    func testQueuedRequestsFinishOnceAndKeepTheirOwnAnswers() async {
        DS1Overlays.cancelAll()
        let first=Task { await DS1Overlays.confirm("First review") };await queued(1)
        let second=Task { await DS1Overlays.confirm("Second review") };await queued(2)
        let request=DS1Overlays.shared.queue[0]
        DS1Overlays.shared.finish(request, "");DS1Overlays.shared.finish(request,nil)
        let one=await first.value;XCTAssertTrue(one);XCTAssertEqual(DS1Overlays.shared.queue.first?.title,"Second review")
        DS1Overlays.cancelAll();let two=await second.value;XCTAssertFalse(two)
    }
    func testPromptDraftSurvivesPresenterReattachmentAndClearsWhenFinished() async {
        DS1Overlays.cancelAll()
        let task=Task { await DS1Overlays.prompt("A prompt", value:"Original") };await queued(1)
        let request=DS1Overlays.shared.queue[0]
        DS1Overlays.shared.rememberPrompt(request.id,value:"Retained 日本語")
        XCTAssertEqual(DS1Overlays.shared.promptValue(request),"Retained 日本語")
        DS1Overlays.shared.finish(request,"Retained 日本語");let result=await task.value
        XCTAssertEqual(result,"Retained 日本語");XCTAssertEqual(DS1Overlays.shared.promptValue(request),"Original")
    }
}
