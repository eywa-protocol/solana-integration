
export
abstract class ASubscription {
  private subscriptionId: number = 0;

  constructor(
    protected subscriber: () => number,
    protected unsubscriber: (number) => Promise<void>,
  ) {
    //
  }

  public subscribe(): void {
    // console.log('subscribe');
    this.subscriptionId = this.subscriber();
  }

  public unsubscribe(): void {
    // console.log('unsubscribe');
    if ( this.subscriptionId ) {
      // console.log(this.subscriptionId);
      this.unsubscriber(this.subscriptionId);
      this.subscriptionId = 0;
    }
  }
}
